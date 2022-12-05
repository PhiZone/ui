import { locale, loadTranslations } from '$lib/translations/config';

export const load: import('./$types').LayoutServerLoad = async ({ url, locals }) => {
    const { pathname } = url;
    const defaultLocale = 'en';
    const initLocale = locale.get() || defaultLocale;
    await loadTranslations(initLocale, pathname);
    return {
        user: locals.user,
        access_token: locals.access_token,
        refresh_token: locals.refresh_token,
    };
};
