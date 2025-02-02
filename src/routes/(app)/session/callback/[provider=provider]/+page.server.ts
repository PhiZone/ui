import { fail, redirect } from '@sveltejs/kit';
import queryString from 'query-string';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import API, { Gender } from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { SUPPORTED_APPS } from '$lib/constants';
import { t } from '$lib/translations/config';
import { setTokens } from '$lib/utils';
import { login } from '$lib/utils.server';

const schema = z.object({
  Language: z.string().default('zh-CN'),
  RegionCode: z.string().default('CN'),
  Gender: z.nativeEnum(Gender).optional(),
  Biography: z.string().optional(),
  DateOfBirth: z.date().optional(),
});

type Schema = z.infer<typeof schema>;

export const load = async ({ cookies, url, params, locals, fetch }) => {
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const api = new API(fetch, locals.accessToken);
  const code = searchParams.code as string;
  const state = searchParams.state as string;
  if (searchParams.bind) {
    const resp = await api.user.bind(
      params.provider,
      code,
      state,
      url.origin + url.pathname + '?bind=true',
    );
    if (!resp.ok) {
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        await resp.json(),
      );
    }
    redirect(
      303,
      resp.ok
        ? '/me/settings?level=success&message=session.bind_success&t=true'
        : '/me/settings?level=error&message=session.bind_failure&t=true',
    );
  } else if (!searchParams.register) {
    const resp = await api.auth.token(
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'password',
        username: code,
        password: state,
      },
      params.provider,
      url.origin + url.pathname,
    );
    if (!resp.ok) {
      const error = await resp.json();
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        error,
      );
      redirect(
        303,
        `/session/login?level=error&message=${encodeURI(
          error.error === 'invalid_token'
            ? t.get('session.login.invalid_token_link', {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                provider: SUPPORTED_APPS.find(
                  (app) => app.name.toLowerCase() === params.provider.toLowerCase(),
                ).name,
              })
            : t.get(`session.login.${error.error}`),
        )}`,
      );
    }

    const { access_token, refresh_token } = await resp.json();
    setTokens(cookies, access_token, refresh_token);

    redirect(303, url.searchParams.get('redirect') ?? '/');
  }

  const form = await superValidate(zod(schema));
  return { register: true, provider: params.provider, form };
};

export const actions = {
  default: async ({ request, url, cookies, params, fetch }) => {
    const api = new API(fetch);

    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }
    const { ...opts } = form.data;

    const resp = await api.user.registerWithProvider(
      opts,
      params.provider,
      url.searchParams.get('code')!,
      url.searchParams.get('state')!,
      url.origin + url.pathname + '?register=true',
    );
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
