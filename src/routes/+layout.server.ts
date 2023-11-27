import { defaultLocale } from '$lib/constants';
import { loadTranslations } from '$lib/translations/config';

export const load = async ({ locals, url, cookies }) => {
  await loadTranslations(cookies.get('language') ?? defaultLocale, url.pathname);
  return {
    accessToken: locals.accessToken,
    user: locals.user,
    language: cookies.get('language') ?? defaultLocale,
    lastRetrieval: locals.lastRetrieval,
  };
};
