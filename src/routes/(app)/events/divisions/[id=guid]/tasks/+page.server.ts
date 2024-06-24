import API from '$lib/api';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import { t } from '$lib/translations/config';
import { ResponseDtoStatus } from '$lib/api/types';
import { toCamel } from '$lib/utils';

const schema = z.object({
  divisionId: z.string(),
  isHidden: z.boolean(),
  name: z.string(),
  type: z.number(),
  description: z.string(),
  dateExecuted: z.date().optional(),
  code: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export const load = async () => {
  const form = await superValidate(schema);
  return { form };
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);

    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    const resp = await api.event.task.create({ ...form.data });
    if (resp.ok) {
      return;
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
