import { REDIS_CONNECTION } from '$env/static/private';
import queryString from 'query-string';
import { createClient } from 'redis';

interface Vote {
  id: string;
  official: boolean;
  score: number;
  message: string;
  name: string;
  user?: number;
  date: Date;
}

export const load = async ({ params, url, cookies }) => {
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
      data: null,
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

  const client = createClient({
    url: REDIS_CONNECTION,
  });

  client.on('err', (err) => {
    console.log('redis client error: ', err);
  });

  client.connect();
  const data: Vote[] = (await client.lRange(`crs:${params.id}`, 0, -1)).map(
    (str) => JSON.parse(str) as Vote,
  );
  client.quit();
  return {
    official: token == official,
    data,
  };
};

export const actions = {
  vote: async ({ params, request }) => {
    const client = createClient({
      url: REDIS_CONNECTION,
    });

    client.on('err', (err) => {
      console.log('redis client error: ', err);
    });

    client.connect();
    const data = await request.formData();
    const vote: Vote = {
      id: crypto.randomUUID(),
      official: data.get('official') == 'true',
      score: parseInt(data.get('score') as string),
      message: data.get('message') as string,
      name: data.get('name') as string,
      user: data.get('user') ? parseInt(data.get('user') as string) : undefined,
      date: new Date(),
    };
    client.rPush(`crs:${params.id}`, JSON.stringify(vote));
    client.quit();
  },
};
