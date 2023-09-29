import queryString from 'query-string';

export const load = async ({ url, cookies }) => {
  const official = 'b55y6u83e6bmyu9eryehie24bg4h6n2mu8s';
  const fanmade = 'rv7t590oie5yb64u3t4gh82hu1eg0dopthl';
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  if (
    searchParams.secToken != official &&
    searchParams.secToken != fanmade &&
    cookies.get('sec_token') != official &&
    cookies.get('sec_token') != fanmade
  ) {
    return {
      official: null,
    };
  }

  let token = '';
  if (searchParams.secToken) {
    cookies.set('sec_token', searchParams.secToken as string, {
      path: '/',
      maxAge: 1209600,
    });
    token = searchParams.secToken as string;
  } else {
    token = cookies.get('sec_token') as string;
  }

  return {
    official: token == official,
  };
};
