import { locale, loadTranslations } from '$lib/translations/config';

export const load: import('./$types').LayoutServerLoad = async ({ url, locals, cookies }) => {
    const { pathname } = url;
    const defaultLocale = 'en';
    const initLocale = locale.get() || defaultLocale;
    await loadTranslations(initLocale, pathname);
    if (!locals.user && locals.access_token && locals.refresh_token) {
        cookies.set('access_token', locals.access_token);
        cookies.set('refresh_token', locals.refresh_token);
    }
    return {
        user: locals.user,
        access_token: locals.access_token,
        refresh_token: locals.refresh_token,
    };
};
