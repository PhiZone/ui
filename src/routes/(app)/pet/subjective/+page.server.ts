import API from '$lib/api';
import { compile } from 'mdsvex';
import rehypeKatexSvelte from 'rehype-katex-svelte';
import remarkMath from 'remark-math';
import queryString from 'query-string';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import type { Plugin } from 'unified';
import type { KatexOptions } from 'katex';
import { fail, redirect } from '@sveltejs/kit';
import { t } from '$lib/translations/config';
import { ResponseDtoStatus } from '$lib/api/types';

const schema = z.object({
  answer1: z.string(),
  answer2: z.string(),
  answer3: z.string(),
  chart: z.string(),
});

type Schema = z.infer<typeof schema>;

export const load = async ({ url, fetch, locals }) => {
  const form = await superValidate(schema);
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  let answers;
  try {
    answers = JSON.parse(searchParams.answers as string);
  } catch (e) {
    return { status: 1, form };
  }
  if (!searchParams.answers || !isNumberMatrix(answers)) return { status: 1, form };
  const api = new API(fetch, locals.accessToken, locals.user);
  const resp = await api.pet.listSubjective(answers.map((entry) => ({ choices: entry })));
  if (!resp.ok) {
    const error = await resp.json();
    return { status: 2, error: error.code, form };
  }
  const questions = (await resp.json()).data;
  for (let i = 0; i < questions.length; i++) {
    questions[i].content =
      (
        await compile(questions[i].content ?? '', {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatexSvelte as Plugin<[KatexOptions?], string, unknown>],
        })
      )?.code
        .replaceAll('\\', '')
        .replaceAll('{@html "', '')
        .replaceAll('"}', '') ?? '';
    questions[i].choices = await Promise.all(
      (questions[i].choices ?? []).map(
        async (choice) =>
          (
            await compile(choice ?? '', {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatexSvelte as Plugin<[KatexOptions?], string, unknown>],
            })
          )?.code
            .replaceAll('\\', '')
            .replaceAll('{@html "', '')
            .replaceAll('"}', '') ?? '',
      ),
    );
  }
  return {
    status: 0,
    questions,
    form,
  };
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken, locals.user);

    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    const resp = await api.pet.answerSubjective({ ...form.data });
    if (resp.ok) {
      throw redirect(303, '/pet/answers');
    } else {
      const error = await resp.json();
      console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, error);
      form.valid = false;
      if (error.status === ResponseDtoStatus.ErrorBrief) {
        form.message = t.get(`error.${error.code}`);
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        form.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
        form.errors = {};
        error.errors.forEach(({ field, errors }) => {
          form.errors[field as keyof Schema] = errors.map((value) => {
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
