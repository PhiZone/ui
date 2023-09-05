import API from '$lib/api';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail, redirect } from '@sveltejs/kit';
import { t } from '$lib/translations/config';
import { ResponseDtoStatus } from '$lib/api/types';

const schema = z
  .object({
    Code: z.string(),
    Password: z.string().regex(/^(?=.*[^a-zA-Z0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,18}$/, {
      message: t.get('session.invalid_password'),
    }),
    ConfirmPassword: z.string(),
  })
  .refine(({ Password, ConfirmPassword }) => Password === ConfirmPassword, {
    message: t.get('session.passwords_differ'),
    path: ['ConfirmPassword'],
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

    const { ConfirmPassword: _, ...opts } = form.data;
    const resp = await api.auth.resetPassword(opts);
    if (resp.ok) {
      throw redirect(303, '/session/login' + url.search);
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
