import queryString from 'query-string';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { locale, t } from '$lib/translations/config';
import { renderMarkdown, toCamel } from '$lib/utils';

const schema = z.object({
  answer1: z.string(),
  answer2: z.string(),
  answer3: z.string(),
  chart: z.string(),
});

type Schema = z.infer<typeof schema>;

export const load = async ({ url, fetch, locals }) => {
  const form = await superValidate(zod(schema));
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  let answers;
  try {
    answers = JSON.parse(searchParams.answers as string);
  } catch {
    return { status: 1, form };
  }
  if (!searchParams.answers || !isNumberMatrix(answers)) return { status: 1, form };
  const api = new API(fetch, locals.accessToken);
  const resp = await api.pet.listSubjective(answers.map((entry) => ({ choices: entry })));
  if (!resp.ok) {
    const error = await resp.json();
    return { status: 2, error: error.code, form };
  }
  const questions = (await resp.json()).data;
  questions.push({
    position: 19,
    type: 2,
    content: t.get('pet.chart_question'),
    choices: null,
    language: locale.get(),
  });
  for (const question of questions) {
    question.content = renderMarkdown(question.content);
    if (question.choices) {
      question.choices = question.choices.map(renderMarkdown);
    }
  }
  return {
    status: 0,
    questions,
    form,
  };
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);

    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const resp = await api.pet.answerSubjective({ ...form.data });
    if (resp.ok) {
      redirect(303, '/pet/answers');
    } else {
      const error = await resp.json();
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        error,
      );
      form.valid = false;
      if (error.status === ResponseDtoStatus.ErrorBrief) {
        form.message = t.get(`error.${error.code}`);
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        form.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
        form.message = t.get(`error.${error.code}`);
        form.errors = {};
        error.errors.forEach(({ field, errors }) => {
          form.errors[toCamel(field) as keyof Schema] = errors.map((value) => {
            return t.get(`error.${value}`);
          });
        });
      }

      return fail(resp.status, { form });
    }
  },
};

const isNumberMatrix = (obj: unknown): obj is number[][] => {
  return (
    obj instanceof Array &&
    obj.every((row) => row instanceof Array && row.every((x) => typeof x === 'number'))
  );
};
