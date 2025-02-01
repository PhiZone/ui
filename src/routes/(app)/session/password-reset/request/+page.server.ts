import API from '$lib/api';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { SendEmailMode } from '$lib/api/auth';
import { fail, redirect } from '@sveltejs/kit';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { parseDateTime } from '$lib/utils';

const schema = z.object({
  Email: z.string(),
});

type Schema = z.infer<typeof schema>;

export const load = async () => {
  const form = await superValidate(schema);
  return { form };
};

export const actions = {
  default: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);

    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    const resp = await api.auth.sendEmail({ ...form.data, Mode: SendEmailMode.PasswordReset });
    if (resp.ok) {
      redirect(303, '/session/password-reset' + url.search);
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
      } else if (error.status === ResponseDtoStatus.ErrorTemporarilyUnavailable) {
        form.message = `${t.get(`error.${error.code}`)}\n\n${t.get('common.date_available')}${t.get(
          'common.colon',
        )}${parseDateTime(error.dateAvailable)}`;
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
    }
  },
};
