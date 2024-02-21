import { REDIS_CONNECTION } from '$env/static/private';
import { createClient } from 'redis';
import { redirect } from '@sveltejs/kit';
import { OFFICIAL_SECTOKEN, FANMADE_SECTOKEN } from '$env/static/private';

interface Vote {
  id: string;
  official: boolean | null;
  score: number;
  message: string;
  name: string;
  user?: number;
  date: Date;
}

export const load = async ({ params, cookies }) => {
  if (
    cookies.get('sec_token') == OFFICIAL_SECTOKEN ||
    cookies.get('sec_token') == FANMADE_SECTOKEN
  ) {
    throw redirect(302, `/crs/${params.id}`);
  }

  const client = createClient({
    url: REDIS_CONNECTION,
  });

  client.on('err', (err) => {
    console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, 'redis client: ', err);
  });

  client.connect();
  const data: Vote[] = (await client.lRange(`phizone:crs:${params.id}`, 0, -1)).map(
    (str) => JSON.parse(str) as Vote,
  );
  client.quit();
  return {
    data,
  };
};

export const actions = {
  vote: async ({ params, request }) => {
    const client = createClient({
      url: REDIS_CONNECTION,
    });

    client.on('err', (err) => {
      console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, 'redis client: ', err);
    });

    client.connect();
    const data = await request.formData();
    const vote: Vote = {
      id: crypto.randomUUID(),
      official: null,
      score: parseFloat(data.get('score') as string),
      message: data.get('message') as string,
      name: data.get('name') as string,
      user: parseInt(data.get('user') as string),
      date: new Date(),
    };
    client.rPush(`phizone:crs:${params.id}`, JSON.stringify(vote));
    client.quit();
  },
};
