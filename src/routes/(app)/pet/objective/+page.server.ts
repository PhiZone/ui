import { fail } from '@sveltejs/kit';

import API from '$lib/api';
import { renderMarkdown } from '$lib/utils';

export const load = async ({ fetch, locals }) => {
  const api = new API(fetch, locals.accessToken);
  const resp = await api.pet.listObjective();
  if (!resp.ok) {
    const error = await resp.json();
    console.error(
      `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
      error,
    );
    throw fail(resp.status, { error: error.code });
  }
  const questions = (await resp.json()).data;
  for (const question of questions) {
    question.content = renderMarkdown(question.content);
    if (question.choices) {
      question.choices = question.choices.map(renderMarkdown);
    }
  }
  return {
    questions,
  };
};
