import API from '$lib/api';
import { defaultLocale } from '$lib/constants';
import { loadTranslations, locale } from '$lib/translations/config';
import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';

export const load = async ({ url, data, fetch }) => {
  const language = data.user?.language ?? globalThis.navigator?.language ?? defaultLocale;

  await loadTranslations(language, url.pathname);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        refetchOnWindowFocus: false,
      },
    },
  });

  const api = new API(fetch, data.accessToken, data.user);

  if (
    data.accessToken &&
    (!data.lastRetrieval ||
      url.pathname.startsWith('/me/notifications') ||
      Date.now() - data.lastRetrieval > 20000)
  ) {
    const resp = await api.user.me();
    if (resp.ok) {
      data.user = (await resp.json()).data;
      locale.set(data.user.language);
      data.lastRetrieval = Date.now();
    } else if (window) {
      window.location.reload();
    }
  }

  return {
    user: data.user,
    api,
    queryClient,
  };
};
