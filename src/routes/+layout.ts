import API from '$lib/api';
import { defaultLocale } from '$lib/constants';
import { locale, loadTranslations } from '$lib/translations/config';
import { convertLanguageCode } from '$lib/utils';
import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';

export const load = async ({ url, data, fetch }) => {
  let lang;
  if (browser && window.localStorage.getItem('lang')) {
    lang = window.localStorage.getItem('lang');
  }

  lang ||= locale.get();

  if (browser) {
    lang ||= convertLanguageCode(window.navigator.language);
  }

  lang ||= defaultLocale;

  await loadTranslations(lang, url.pathname);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        refetchOnWindowFocus: false,
      },
    },
  });

  return {
    user: data.user,
    api: new API(fetch, data.access_token, data.user),
    queryClient,
  };
};
