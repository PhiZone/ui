<script lang="ts">
  import '../app.css';
  import 'cropperjs/dist/cropper.min.css';
  import { locale } from '$lib/translations/config';
  import { browser } from '$app/environment';
  import { QueryClientProvider } from '@tanstack/svelte-query';

  export let data;

  // if (
  //   !$page.data.access_token &&
  //   $page.data.refresh_token &&
  //   browser &&
  //   !$page.url.pathname.startsWith('/session') &&
  //   !$page.url.pathname.startsWith('/auth')
  // ) {
  //   window.location.href = `/session/refresh?redirect=${encodeURIComponent(
  //     $page.url.pathname + $page.url.search
  //   )}`;
  // }

  // if (!$page.data.user && $page.data.access_token && $page.data.refresh_token && browser) {
  //   window.location.reload();
  // }

  if (browser) {
    const language = locale.get() || data.user?.language || window.navigator.language;
    locale.set(language);
    console.log('Language:', language);
  }
</script>

<QueryClientProvider client={data.queryClient}>
  <slot />
</QueryClientProvider>
