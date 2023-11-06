import API from '$lib/api';
import type { PetQuestionDto } from '$lib/api/pet';
import { t } from '$lib/translations/config';
import { fail } from '@sveltejs/kit';
import { compile } from 'mdsvex';
import rehypeKatexSvelte from 'rehype-katex-svelte';
import remarkMath from 'remark-math';
import type { Plugin } from 'unified';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { ResponseDtoStatus } from '$lib/api/types';

const schema = z.object({
  id: z.string(),
  score: z.number().min(0).max(60),
});

type Schema = z.infer<typeof schema>;

export const load = async ({ params, locals, fetch }) => {
  const api = new API(fetch, locals.accessToken, locals.user);
  const resp = await api.pet.getAnswer({ id: params.id });
  if (!resp.ok) {
    const error = await resp.json();
    console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, error);
    throw fail(resp.status, t.get(`error.${error.code}`));
  }
  const answer = (await resp.json()).data;
  answer.question1.content = await compileQuestion(answer.question1);
  answer.question2.content = await compileQuestion(answer.question2);
  answer.question3.content = await compileQuestion(answer.question3);
  const form = await superValidate(schema);
  return {
    answer,
    form,
  };
};

export const actions = {
  assess: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }
    const resp = await api.pet.assess(form.data);
    if (resp.ok) {
      return;
    } else {
      try {
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
      } catch (e) {
        return fail(resp.status);
      }
    }
  },
};

const compileQuestion = async (question: PetQuestionDto) => {
  return (
    (
      await compile(question.content ?? '', {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatexSvelte as Plugin],
      })
    )?.code
      .replaceAll('\\', '')
      .replaceAll('{@html "', '')
      .replaceAll('"}', '') ?? ''
  );
};
