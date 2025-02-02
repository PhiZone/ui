import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';

const schema = z.object({
  Name: z.string(),
  Icon: z.custom<File>().nullable(),
  Description: z.string().nullable(),
  ClaimedParticipantCount: z.number(),
  ClaimedSubmissionCount: z.number(),
  DivisionId: z.string(),
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
    // eslint-disable-next-line prefer-const
    let { Icon, ...rest } = form.data;
    Icon = formData.get('Icon') as File;
    if (Icon.size == 0) Icon = null;
    const resp = await api.event.team.create({ Icon, ...rest });
    if (resp.ok) {
      redirect(
        303,
        `/events/divisions/${form.data.DivisionId}?level=success&message=${t.get(
          'event.team.created',
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            team: form.data.Name,
          },
        )}`,
      );
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
            form.errors[field as keyof Schema] = errors.map((value) => {
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
