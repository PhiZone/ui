<script lang="ts">
  import '@fortawesome/fontawesome-free/css/all.min.css';
  import { QueryClientProvider } from '@tanstack/svelte-query';

  import '../app.css';

  let { data, children } = $props();
</script>

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
