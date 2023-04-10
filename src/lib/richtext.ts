import { htmlEscape } from 'escape-goat';
import { createQueries } from '@tanstack/svelte-query';
import { writable, type Readable, derived } from 'svelte/store';
import type API from './api';

export function richtext(content: string, api?: API): Readable<string> {
  content = htmlEscape(content);

  const { subscribe } = writable(
    content
      .replaceAll(
        /\[PZUser(At)?:(\d+)(?::PZRT)?\]/gi,
        (_, at: string, id: string) => `[PZUser${at ?? ''}:${id}:${id}]`
      )
      .replaceAll(
        /\[PZUser(At)?:(\d+):(.+?)(?::PZRT)?\]/gi,
        (_, at: string | undefined, id: string, name: string) =>
          `<a href="/users/${id}" class="richtext-user">${at ? '@' : ''}${name}</a>`
      )
  );

  if (api) {
    const ids = [
      ...new Set(
        [...content.matchAll(/\[PZUser(?:At)?:(\d+)(?::PZRT)?\]/gi)].map((match) =>
          parseInt(match[1])
        )
      ),
    ];
    if (ids.length !== 0) {
      const queries = createQueries(ids.map((id) => api.user.info({ id })));
      return derived(queries, (queries) => {
        if (queries.every((query) => query.isSuccess)) {
          const users = new Map(queries.map(({ data: user }) => [user!.id, user!.username]));
          return content
            .replaceAll(
              /\[PZUser(At)?:(\d+)(?::PZRT)?\]/gi,
              (_, at: string, id: string) =>
                `[PZUser${at ?? ''}:${id}:${users?.get(parseInt(id)) ?? id}]`
            )
            .replaceAll(
              /\[PZUser(At)?:(\d+):(.+?)(?::PZRT)?\]/gi,
              (_, at: string | undefined, id: string, name: string) =>
                `<a href="/users/${id}" class="richtext-user">${at ? '@' : ''}${name}</a>`
            );
        }
        return content
          .replaceAll(
            /\[PZUser(At)?:(\d+)(?::PZRT)?\]/gi,
            (_, at: string, id: string) => `[PZUser${at ?? ''}:${id}:${id}]`
          )
          .replaceAll(
            /\[PZUser(At)?:(\d+):(.+?)(?::PZRT)?\]/gi,
            (_, at: string | undefined, id: string, name: string) =>
              `<a href="/users/${id}" class="richtext-user">${at ? '@' : ''}${name}</a>`
          );
      });
    }
  }

  return {
    subscribe,
  };
}
