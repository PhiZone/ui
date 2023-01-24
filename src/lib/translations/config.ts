import i18n from 'sveltekit-i18n';
import lang from './lang.json';

/** @type {import('sveltekit-i18n').Config} */
const config = {
    fallbackLocale: 'en',
    translations: {
        en: { lang },
        'zh-Hans': { lang },
    },
    loaders: [
        {
            locale: 'en',
            key: 'common',
            loader: async () => (await import('./en/common.json')).default,
        },
        {
            locale: 'en',
            key: 'home',
            loader: async () => (await import('./en/home.json')).default,
        },
        {
            locale: 'en',
            key: 'session',
            loader: async () => (await import('./en/session.json')).default,
        },
        {
            locale: 'en',
            key: 'challenge',
            loader: async () => (await import('./en/challenge.json')).default,
        },
        {
            locale: 'en',
            key: 'chapter',
            loader: async () => (await import('./en/chapter.json')).default,
        },
        {
            locale: 'en',
            key: 'song',
            loader: async () => (await import('./en/song.json')).default,
        },
        {
            locale: 'en',
            key: 'chart',
            loader: async () => (await import('./en/chart.json')).default,
        },
        {
            locale: 'en',
            key: 'user',
            loader: async () => (await import('./en/user.json')).default,
        },
        {
            locale: 'en',
            key: 'recorder',
            loader: async () => (await import('./en/recorder.json')).default,
        },
        {
            locale: 'en',
            key: 'notification',
            loader: async () => (await import('./en/notification.json')).default,
        },
        {
            locale: 'en',
            key: 'record',
            loader: async () => (await import('./en/record.json')).default,
        },
        {
            locale: 'en',
            key: 'studio',
            loader: async () => (await import('./en/studio.json')).default,
        },
        {
            locale: 'en',
            key: 'admin',
            loader: async () => (await import('./en/admin.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'common',
            loader: async () => (await import('./zh-Hans/common.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'home',
            loader: async () => (await import('./zh-Hans/home.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'session',
            loader: async () => (await import('./zh-Hans/session.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'challenge',
            loader: async () => (await import('./zh-Hans/challenge.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'chapter',
            loader: async () => (await import('./zh-Hans/chapter.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'song',
            loader: async () => (await import('./zh-Hans/song.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'chart',
            loader: async () => (await import('./zh-Hans/chart.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'user',
            loader: async () => (await import('./zh-Hans/user.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'recorder',
            loader: async () => (await import('./zh-Hans/recorder.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'notification',
            loader: async () => (await import('./zh-Hans/notification.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'record',
            loader: async () => (await import('./zh-Hans/record.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'studio',
            loader: async () => (await import('./zh-Hans/studio.json')).default,
        },
        {
            locale: 'zh-Hans',
            key: 'admin',
            loader: async () => (await import('./zh-Hans/admin.json')).default,
        },
    ],
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);

loading.subscribe(($loading) => $loading);
