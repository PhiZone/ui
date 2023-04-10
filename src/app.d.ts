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
    user?: import('$lib/models').User;
    api: import('$lib/api').default;
    queryClient?: import('@tanstack/svelte-query').QueryClient;
  }
  // interface Platform {}
  // interface Session {}
  // interface Stuff {}
}

interface TypedOkResponse<R> extends Response {
  ok: true;
  json(): Promise<R>;
}

interface TypedErrorResponse<E> extends Response {
  ok: false;
  json(): Promise<E>;
}

type TypedResponse<R, E> = TypedOkResponse<R> | TypedErrorResponse<E>;

// type Fetch<R, E = import('$lib/api').CommonError> = (
//   input: RequestInfo | URL,
//   init?: RequestInit
// ) => Promise<TypedResponse<R, E>>;
