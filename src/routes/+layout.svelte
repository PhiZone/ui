<script lang="ts">
  import '../app.css';
  import 'cropperjs/dist/cropper.min.css';
  import { QueryClientProvider } from '@tanstack/svelte-query';

  export let data;
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
<div class="rating-lg" hidden />
<div class="alert-info" hidden />
<div class="alert-success" hidden />
<div class="alert-warning" hidden />
<div class="alert-error" hidden />
<div class="btn-info" hidden />
<div class="btn-success" hidden />
<div class="btn-warning" hidden />
<div class="btn-error" hidden />
