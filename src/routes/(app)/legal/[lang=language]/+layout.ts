import { redirect } from '@sveltejs/kit';

export const load = async ({ url, params }) => {
  const langs = ['en-US', 'zh-CN'];
  if (!langs.includes(params.lang)) {
    redirect(303, url.pathname.replace(`/${params.lang}/`, `/${langs[0]}/`));
  }
  return {
    lang: params.lang,
    langs,
  };
};
