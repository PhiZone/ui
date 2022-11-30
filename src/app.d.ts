/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
    interface Locals {
        access_token: string;
        refresh_token: string;
        user: import('@sveltejs/kit/types/private').JSONObject;
    }
    // interface Platform {}
    // interface Session {}
    // interface Stuff {}
}
