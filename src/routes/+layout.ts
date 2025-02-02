import { QueryClient } from '@tanstack/svelte-query';

import { browser } from '$app/environment';
import API from '$lib/api';
import { loadTranslations, locale } from '$lib/translations/config';

export const load = async ({ url, data, fetch }) => {
  await loadTranslations(data.language, url.pathname);
  locale.set(data.language);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        refetchOnWindowFocus: false,
      },
    },
  });

  const api = new API(fetch, data.accessToken);

  return {
    api,
    user: data.user,
    queryClient,
  };
};
