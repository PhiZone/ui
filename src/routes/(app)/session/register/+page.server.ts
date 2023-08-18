import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import API from '$lib/api';
import { t } from '$lib/translations/config';
import { Gender } from '$lib/models';
import { ResponseDtoStatus } from '$lib/api/common';

const schema = z
  .object({
    UserName: z
      .string()
      .regex(
        /^([a-zA-Z0-9_\u4e00-\u9fff\u3041-\u309f\u30a0-\u30ff\uac00-\ud7a3]{3,12})|([\u4e00-\u9fff\u3041-\u309f\u30a0-\u30ff\uac00-\ud7a3]{2,12})|([A-Za-z0-9_]{4,18})$/,
      ),
    Email: z.string().email(),
    Password: z.string().regex(/^(?=.*[^a-zA-Z0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,18}$/),
    ConfirmPassword: z.string(),
    Language: z.string().default('zh-CN'),
    RegionCode: z.string().default('CN'),
    Gender: z.nativeEnum(Gender).optional(),
    Biography: z.string().optional(),
    DateOfBirth: z.date().optional(),
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
    const api = new API(fetch, locals.access_token, locals.user);

    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }
    const { ConfirmPassword: _, ...opts } = form.data;

    const resp = await api.user.register(opts);
    if (resp.ok) {
      throw redirect(303, '/session/email-confirmation' + url.search);
    } else {
      const error = await resp.json();
      form.valid = false;
      if (error.status === ResponseDtoStatus.ErrorBrief) {
        form.message = error.code;
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        form.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
        form.errors = {};
        error.errors.forEach(
          ({ field, errors }) => void (form.errors[field as keyof Schema] = errors),
        );
      }

      return fail(resp.status, { form });
    }
  },
};
