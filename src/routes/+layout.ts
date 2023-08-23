import API, { type UserDetailedDto } from '$lib/api';
import { defaultLocale } from '$lib/constants';
import { locale, loadTranslations } from '$lib/translations/config';
import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';

export const load = async ({ url, data, fetch }) => {
  let lang;
  if (browser && window.localStorage.getItem('lang')) {
    lang = window.localStorage.getItem('lang');
  }

  lang ||= locale.get();

  if (browser) {
    lang ||= window.navigator.language;
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

  const api = new API(fetch, data.accessToken, data.user);

  if (data.accessToken && (!data.lastRetrieval || Date.now() - data.lastRetrieval > 30000)) {
    const resp = await api.user.me();
    if (resp.ok) {
      data.user = (await resp.json()).data as UserDetailedDto;
      data.lastRetrieval = Date.now();
    } else {
      data.accessToken = undefined;
    }
  }

  return {
    user: data.user,
    api,
    queryClient,
  };
};
