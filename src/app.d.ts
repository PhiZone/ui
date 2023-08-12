/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Locals {
    access_token?: string;
    refresh_token?: string;
    user?: import('$lib/models').User;
  }
  interface PageData {
    user?: import('$lib/models').UserDetailedDto;
    api: import('$lib/api').default;
    queryClient?: import('@tanstack/svelte-query').QueryClient;
  }
  // interface Platform {}
  // interface Session {}
  // interface Stuff {}
}

interface TypedResponse<T> extends Response {
  json(): Promise<T>;
}

// type Fetch<R, E = import('$lib/api').CommonError> = (
//   input: RequestInfo | URL,
//   init?: RequestInit
// ) => Promise<TypedResponse<R, E>>;
