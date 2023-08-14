import { htmlEscape } from 'escape-goat';
import { createQueries } from '@tanstack/svelte-query';
import { type Readable, derived, readable } from 'svelte/store';
import type API from './api';

export interface RichContext {
  users?: Map<number, string>;
}

export function preprocess(content: string): string {
  content = htmlEscape(content);
  let result = '';
  let level = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '[') {
      if (level >= 1) result += '&#91;';
      else result += '[';
      level++;
    } else if (content[i] === ']') {
      level--;
      if (level >= 1) result += '&#93;';
      else result += ']';
    } else result += content[i];
  }
  return result.replaceAll(/\[PZ(.+?):PZRT\]/gi, '[PZ$1]');
}

export function transform(content: string, ctx: RichContext): string {
  return (
    content
      // user
      .replaceAll(
        /\[PZUser(At)?:(\d+)\]/gi,
        (_, at: string | undefined, id: string) =>
          `[PZUser${at ?? ''}:${id}:${ctx.users?.get(parseInt(id)) ?? id}]`,
      )
      .replaceAll(
        /\[PZUser(At)?:(\d+):(.+?)\]/gi,
        (_, at: string | undefined, id: string, name: string) =>
          `<a href="/users/${id}" class="richtext-link richtext-user">${at ? '@' : ''}${name}</a>`,
      )
      // chapter
      .replaceAll(
        /\[PZChapter:(\d+):(.+?)\]/gi,
        (_, id: string, name: string) =>
          `<a href="/chapter/${id}" class="richtext-link richtext-chapter">${name}</a>`,
      )
      // song
      .replaceAll(
        /\[PZSong:(\d+):(.+?)\]/gi,
        (_, id: string, name: string) =>
          `<a href="/song/${id}" class="richtext-link richtext-song">${name}</a>`,
      )
      // chart
      .replaceAll(
        /\[PZChart:(\d+):(.+?)\]/gi,
        (_, id: string, name: string) =>
          `<a href="/chart/${id}" class="richtext-link richtext-chart">${name}</a>`,
      )
      // song-upload
      .replaceAll(
        /\[PZSongUpload:(\d+):(.+?)\]/gi,
        (_, id: string, name: string) =>
          `<a href="/studio/song-submissions/${id}" class="richtext-link richtext-song-upload">${name}</a>`,
      )
      // chart-upload
      .replaceAll(
        /\[PZChartUpload:(\d+):(.+?)\]/gi,
        (_, id: string, name: string) =>
          `<a href="/studio/chart-submissions/${id}" class="richtext-link richtext-chart-upload">${name}</a>`,
      )
      // collab
      .replaceAll(
        /\[PZChartCollab:(\d+):(.+?)\]/gi,
        (_, id: string, name: string) =>
          `<a href="/studio/collaborations/${id}" class="richtext-link richtext-collab">${name}</a>`,
      )
  );
}

export function richtext(content: string, api?: API): Readable<string> {
  content = preprocess(content);

  if (api) {
    return derived(
      [
        // users
        createQueries(
          [
            ...new Set(
              [...content.matchAll(/\[PZUser(?:At)?:(\d+)\]/gi)].map((match) => parseInt(match[1])),
            ),
          ].map((id) => api.user.info({ id })),
        ),
      ],
      ([users]) => {
        const ctx: RichContext = {
          users: users.reduce((map, query) => {
            if (query.isSuccess) map.set(query.data.data.id, query.data.data.userName);
            return map;
          }, new Map<number, string>()),
        };
        return transform(content, ctx);
      },
    );
  } else {
    return readable(transform(content, {}));
  }
}
