import API from '$lib/api';
import { fail } from '@sveltejs/kit';
import { compile } from 'mdsvex';
import rehypeKatexSvelte from 'rehype-katex-svelte';
import remarkMath from 'remark-math';
import type { Plugin } from 'unified';
import type { KatexOptions } from 'katex';

export const load = async ({ fetch, locals }) => {
  const api = new API(fetch, locals.accessToken, locals.user);
  const resp = await api.pet.listObjective();
  if (!resp.ok) {
    const error = await resp.json();
    console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, error);
    throw fail(resp.status, { error: error.code });
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
    questions,
  };
};
