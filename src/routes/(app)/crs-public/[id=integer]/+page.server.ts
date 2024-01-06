import { REDIS_CONNECTION } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { createClient } from 'redis';

interface Vote {
  id: string;
  official?: boolean;
  score: number;
  message: string;
  name: string;
  user?: number;
  date: Date;
}

export const load = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
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
      official: undefined,
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
