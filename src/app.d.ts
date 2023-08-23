/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Locals {
    accessToken?: string;
    refreshToken?: string;
    user?: import('$lib/api').UserDetailedDto;
    lastRetrieval?: number;
  }
  interface PageData {
    user?: import('$lib/api').UserDetailedDto;
    api: import('$lib/api').default;
    queryClient?: import('@tanstack/svelte-query').QueryClient;
  }
  // interface Platform {}
  // interface Session {}
  // interface Stuff {}
}
