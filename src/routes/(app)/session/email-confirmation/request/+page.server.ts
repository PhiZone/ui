import API from '$lib/api';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { SendEmailMode } from '$lib/api/auth';
import { fail, redirect } from '@sveltejs/kit';
import { t } from '$lib/translations/config';
import { ResponseDtoStatus } from '$lib/api/types';

const schema = z.object({
  Email: z.string(),
  UserName: z.string(),
  Language: z.string(),
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

    const resp = await api.auth.sendEmail({ ...form.data, Mode: SendEmailMode.EmailConfirmation });
    if (resp.ok) {
      throw redirect(303, '/session/email-confirmation' + url.search);
    } else {
      const error = await resp.json();
      console.log(error);
      form.valid = false;
      if (error.status === ResponseDtoStatus.ErrorBrief) {
        form.message = t.get(`error.${error.code}`);
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        form.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
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
