<script lang="ts">
  import '../app.css';
  import 'cropperjs/dist/cropper.min.css';
  import { locale } from '$lib/translations/config';
  import { browser } from '$app/environment';
  import { QueryClientProvider } from '@tanstack/svelte-query';

  export let data;

  if (browser) {
    const language = locale.get() || data.user?.language || window.navigator.language;
    locale.set(language);
  }
</script>

<QueryClientProvider client={data.queryClient}>
  <slot />
</QueryClientProvider>

<div class="border-indigo-500" hidden />
<div class="border-emerald-500" hidden />
<div class="border-orange-500" hidden />
<div class="border-teal-500" hidden />
<div class="border-amber-500" hidden />
<div class="border-neutral-500" hidden />
<div class="border-stone-500" hidden />
<div class="bg-indigo-500" hidden />
<div class="bg-emerald-500" hidden />
<div class="bg-orange-500" hidden />
<div class="bg-teal-500" hidden />
<div class="bg-amber-500" hidden />
<div class="bg-neutral-500" hidden />
<div class="bg-stone-500" hidden />
