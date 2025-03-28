import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API, { Gender } from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { login } from '$lib/utils.server';

const schema = z
  .object({
    UserName: z
      .string()
      .regex(
        /^([a-zA-Z0-9_\u4e00-\u9fff\u3041-\u309f\u30a0-\u30ff\uac00-\ud7a3]{3,12})|([\u4e00-\u9fff\u3041-\u309f\u30a0-\u30ff\uac00-\ud7a3]{2,12})|([A-Za-z0-9_]{4,18})$/,
        {
          message: t.get('session.invalid_username'),
        },
      ),
    Email: z.string().email({
      message: t.get('session.invalid_email'),
    }),
    Password: z.string().regex(/^.{6,24}$/, {
      message: t.get('session.invalid_password'),
    }),
    ConfirmPassword: z.string(),
    Language: z.string().default('zh-CN'),
    RegionCode: z.string().default('CN'),
    Gender: z.nativeEnum(Gender).optional(),
    Biography: z.string().optional(),
    DateOfBirth: z.date().optional(),
    EmailConfirmationCode: z.string(),
  })
  .refine(({ Password, ConfirmPassword }) => Password === ConfirmPassword, {
    message: t.get('session.passwords_differ'),
    path: ['ConfirmPassword'],
  });

type Schema = z.infer<typeof schema>;

export const load = async () => {
  const form = await superValidate(zod(schema));
  return { form };
};

export const actions = {
  default: async ({ request, url, cookies, fetch }) => {
    const api = new API(fetch);

    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }
    const { ConfirmPassword: _, ...opts } = form.data;

    const resp = await api.user.register(opts);
    if (resp.ok) {
      const data = await resp.json();
      const redirectUri = url.searchParams.get('redirect');
      const external = redirectUri != null && redirectUri.startsWith('http');
      const result = await login(api, data.data.token, cookies);
      redirect(
        303,
        `${redirectUri ?? '/'}${
          external
            ? ''
            : result
              ? `?level=error&message=session.login.${result}&t=true`
              : '?level=success&message=session.registration.success&t=true'
        }`,
      );
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
          form.errors[field as keyof Schema] = errors.map((value) => {
            return t.get(`error.${value}`);
          });
        });
      }

      return fail(resp.status, { form });
    }
  },
};
