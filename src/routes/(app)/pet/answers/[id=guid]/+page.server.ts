import API from '$lib/api';
import type { PetQuestionDto } from '$lib/api/pet.js';
import { t } from '$lib/translations/config';
import { fail } from '@sveltejs/kit';
import { compile } from 'mdsvex';
import rehypeKatexSvelte from 'rehype-katex-svelte';
import remarkMath from 'remark-math';
import type { Plugin } from 'unified';
import type { KatexOptions } from 'katex';

export const load = async ({ params, locals, fetch }) => {
  const api = new API(fetch, locals.accessToken, locals.user);
  const resp = await api.pet.getAnswer({ id: params.id });
  if (!resp.ok) {
    const error = await resp.json();
    console.log(error);
    throw fail(resp.status, t.get(`error.${error.code}`));
  }
  const answer = (await resp.json()).data;
  answer.question1.content = await compileQuestion(answer.question1);
  answer.question2.content = await compileQuestion(answer.question2);
  answer.question3.content = await compileQuestion(answer.question3);
  return {
    answer,
  };
};

const compileQuestion = async (question: PetQuestionDto) => {
  return (
    (
      await compile(question.content ?? '', {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatexSvelte as Plugin<[KatexOptions?], string, unknown>],
      })
    )?.code
      .replaceAll('\\', '')
      .replaceAll('{@html "', '')
      .replaceAll('"}', '') ?? ''
  );
};
