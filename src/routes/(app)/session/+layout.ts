import { locale, loadTranslations } from '$lib/translations/config';

export const load: import('./$types').LayoutLoad = async ({ url, parent }) => {
    const { pathname } = url;
    const defaultLocale = 'en'; // get from cookie, user session, ...
    const initLocale = locale.get() || defaultLocale; // set default if no locale already set
    await loadTranslations(initLocale, pathname); // keep this just before the `return`
    const { user, access_token, refresh_token } = await parent();
    console.log('r1.5', refresh_token);
    return { user, access_token, refresh_token };
};
