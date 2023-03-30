/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Locals {
    access_token: string | undefined;
    refresh_token: string | undefined;
    user: import('@sveltejs/kit/types/private').JSONObject | undefined;
  }
  // interface Platform {}
  // interface Session {}
  // interface Stuff {}
}
