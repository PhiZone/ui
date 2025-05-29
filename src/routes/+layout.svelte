<script lang="ts">
  import '../app.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import * as env from '$env/static/public';

  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { dev } from '$app/environment';

  let { data, children } = $props();
  if (env.PUBLIC_ENV === 'vercel') injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

{#if 'PUBLIC_PROMO_LINK' in env}
  <!-- svelte-ignore a11y_missing_attribute -->
  <iframe src={env.PUBLIC_PROMO_LINK as string} class="hidden"></iframe>
{/if}
<QueryClientProvider client={data.queryClient}>
  {@render children?.()}
</QueryClientProvider>

<div class="border-indigo-500" hidden></div>
<div class="border-emerald-500" hidden></div>
<div class="border-orange-500" hidden></div>
<div class="border-teal-500" hidden></div>
<div class="border-amber-500" hidden></div>
<div class="border-neutral-500" hidden></div>
<div class="border-stone-500" hidden></div>
<div class="bg-indigo-500" hidden></div>
<div class="bg-emerald-500" hidden></div>
<div class="bg-orange-500" hidden></div>
<div class="bg-teal-500" hidden></div>
<div class="bg-amber-500" hidden></div>
<div class="bg-neutral-500" hidden></div>
<div class="bg-stone-500" hidden></div>
<div class="rating-lg" hidden></div>
<div class="alert-info" hidden></div>
<div class="alert-success" hidden></div>
<div class="alert-warning" hidden></div>
<div class="alert-error" hidden></div>
<div class="btn-info" hidden></div>
<div class="btn-success" hidden></div>
<div class="btn-warning" hidden></div>
<div class="btn-error" hidden></div>
