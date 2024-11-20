import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { toCamel } from '$lib/utils';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

const resourceSchema = z.object({
  resourceType: z.enum(['songs', 'charts', 'records', 'tags']),
  id: z.string(),
  divisionId: z.string(),
  type: z.number(),
  label: z.string().optional(),
  description: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  score: z.number().optional(),
  teamId: z.string().optional(),
});

type ResourceSchema = z.infer<typeof resourceSchema>;

export const load = async () => {
  const resourceForm = await superValidate(resourceSchema);
  return { resourceForm };
};

export const actions = {
  resource: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const resourceForm = await superValidate(formData, resourceSchema);

    if (!resourceForm.valid) {
      return fail(400, { resourceForm });
    }
    const resp = await api.event.resource.create(resourceForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        resourceForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          resourceForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          resourceForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          resourceForm.message = t.get(`error.${error.code}`);
          resourceForm.errors = {};
          error.errors.forEach(({ field, errors }) => {
            resourceForm.errors[toCamel(field) as keyof ResourceSchema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { resourceForm });
      } catch {
        return fail(resp.status);
      }
    }
  },
};
