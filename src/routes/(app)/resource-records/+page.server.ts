import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { toCamel } from '$lib/utils';

const schema = z.object({
  authorName: z.string(),
  copyrightOwner: z.string(),
  description: z.string().optional(),
  edition: z.string().optional(),
  editionType: z.number(),
  source: z
    .string()
    .trim()
    .url({
      message: t.get('error.InvalidUrl'),
    }),
  strategy: z.number(),
  title: z.string(),
  type: z.number(),
});

type Schema = z.infer<typeof schema>;

export const load = async () => {
  const form = await superValidate(zod(schema));
  return { form };
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);

    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const resp = await api.resourceRecord.create({ ...form.data });
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
