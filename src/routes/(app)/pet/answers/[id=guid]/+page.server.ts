import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { locale, t } from '$lib/translations/config';
import { renderMarkdown, toCamel } from '$lib/utils';

const schema = z.object({
  id: z.string(),
  score: z.number().min(0).max(60),
});

type Schema = z.infer<typeof schema>;

export const load = async ({ params, locals, fetch }) => {
  const api = new API(fetch, locals.accessToken);
  const resp = await api.pet.getAnswer({ id: params.id });
  if (!resp.ok) {
    const error = await resp.json();
    console.error(
      `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
      error,
    );
    throw fail(resp.status, t.get(`error.${error.code}`));
  }
  const answer = (await resp.json()).data;
  answer.question1.content = renderMarkdown(answer.question1.content);
  answer.question2.content = renderMarkdown(answer.question2.content);
  answer.question3.content = renderMarkdown(answer.question3.content);
  answer.question4 = {
    position: 19,
    type: 2,
    content: t.get('pet.chart_question'),
    choices: null,
    language: locale.get(),
  };
  const form = await superValidate(zod(schema));
  return {
    answer,
    form,
  };
};

export const actions = {
  assess: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }
    const resp = await api.pet.assess(form.data);
    if (resp.ok) {
      return;
    } else {
      try {
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
      } catch {
        return fail(resp.status);
      }
    }
  },
};
