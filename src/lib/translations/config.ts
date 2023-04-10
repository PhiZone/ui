import I18n, { type Config } from 'sveltekit-i18n';
import type { Translations } from '@sveltekit-i18n/base';
import lang from './lang.json';

const createLoaders = (
  lang: string,
  loaders: Record<string, () => Promise<Translations.Input>>
) => {
  return Object.entries(loaders).map(([path, loader]) => {
    const key = path.match(/\.\/(.*?)\/(.*?)\.json/)?.[2]!;
    return {
      locale: lang,
      key,
      loader,
    };
  });
};

const config = {
  initLocale: 'zh-Hans',
  fallbackLocale: 'en',
  translations: {
    en: { lang },
    'zh-Hans': { lang },
    'zh-Hant': { lang },
  },
  loaders: [
    ...createLoaders(
      'en',
      import.meta.glob<Translations.Input>('./en/*.json', { import: 'default' })
    ),
    ...createLoaders(
      'zh-Hans',
      import.meta.glob<Translations.Input>('./zh-Hans/*.json', { import: 'default' })
    ),
    ...createLoaders(
      'zh-Hant',
      import.meta.glob<Translations.Input>('./zh-Hant/*.json', { import: 'default' })
    ),
  ],
} satisfies Config;

export const { t, locale, locales, loading, loadTranslations } = new I18n(config);

loading.subscribe(($loading) => $loading);
