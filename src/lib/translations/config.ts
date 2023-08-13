import I18n from 'sveltekit-i18n';
import type { Translations } from '@sveltekit-i18n/base';
import lang from './lang.json';

const createLoaders = (
  lang: string,
  loaders: Record<string, () => Promise<Translations.Input>>,
) => {
  return Object.entries(loaders).map(([path, loader]) => {
    const key = path.match(/\.\/(.*?)\/(.*?)\.json/)![2];
    return {
      locale: lang,
      key,
      loader,
    };
  });
};

export const { t, locale, locales, loading, loadTranslations } = new I18n({
  initLocale: 'zh-CN',
  fallbackLocale: 'en',
  translations: {
    en: { lang },
    'zh-CN': { lang },
    'zh-TW': { lang },
  },
  loaders: [
    ...createLoaders(
      'en',
      import.meta.glob<Translations.Input>('./en/*.json', { import: 'default' }),
    ),
    ...createLoaders(
      'zh-CN',
      import.meta.glob<Translations.Input>('./zh-CN/*.json', { import: 'default' }),
    ),
    ...createLoaders(
      'zh-TW',
      import.meta.glob<Translations.Input>('./zh-TW/*.json', { import: 'default' }),
    ),
  ],
});

loading.subscribe(($loading) => $loading);
