import { defaultLocale } from '$lib/constants';
import { loadTranslations } from '$lib/translations/config';

export const load = async ({ locals, url, cookies }) => {
  await loadTranslations(cookies.get('language') ?? defaultLocale, url.pathname);
  return {
    user: locals.user,
    accessToken: locals.accessToken,
    language: cookies.get('language') ?? defaultLocale,
  };
};
