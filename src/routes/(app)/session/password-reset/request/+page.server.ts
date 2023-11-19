import API from '$lib/api';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { SendEmailMode } from '$lib/api/auth';
import { fail, redirect } from '@sveltejs/kit';
import { ResponseDtoStatus } from '$lib/api/types';

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
    const api = new API(fetch, locals.accessToken, locals.user);

    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    const resp = await api.auth.sendEmail({ ...form.data, Mode: SendEmailMode.PasswordReset });
    if (resp.ok) {
      throw redirect(303, '/session/password-reset' + url.search);
    } else {
      const error = await resp.json();
      console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, error);
      form.valid = false;
      if (error.status === ResponseDtoStatus.ErrorBrief) {
        form.message = `error.${error.code}`;
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        form.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
        form.errors = {};
        error.errors.forEach(({ field, errors }) => {
          form.errors[field as keyof Schema] = errors.map((value) => {
            return `error.${value}`;
          });
        });
      }

      return fail(resp.status, { form });
    }
  },
};
