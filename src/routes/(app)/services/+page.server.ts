import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { TAG_JOINER } from '$lib/constants';
import { t } from '$lib/translations/config';
import { toCamel } from '$lib/utils';

const schema = z.object({
  resourceId: z.string().optional(),
  name: z.string(),
  targetType: z.number(),
  description: z.string(),
  parameters: z.string(),
  code: z.string(),
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
    const { parameters: tagsRaw, ...rest } = form.data;
    const parameters = tagsRaw ? tagsRaw.split(TAG_JOINER).map((tag: string) => tag.trim()) : [];
    const resp = await api.service.create({ parameters, ...rest });
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
