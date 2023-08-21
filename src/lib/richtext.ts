import { htmlEscape } from 'escape-goat';
import { type Readable, readable /*, derived */ } from 'svelte/store';
// import { createQueries } from '@tanstack/svelte-query';
// import type API from './api';

// export interface RichContext {
//   users?: Map<number, string>;
// }

// export function preprocess(content: string): string {
//   content = htmlEscape(content);
//   let result = '';
//   let level = 0;
//   for (let i = 0; i < content.length; i++) {
//     if (content[i] === '[') {
//       if (level >= 1) result += '&#91;';
//       else result += '[';
//       level++;
//     } else if (content[i] === ']') {
//       level--;
//       if (level >= 1) result += '&#93;';
//       else result += ']';
//     } else result += content[i];
//   }
//   return result.replaceAll(/\[PZ(.+?):PZRT\]/gi, '[PZ$1]');
// }

export function preprocess(content: string): string {
  return htmlEscape(content);
}

export function transform(content: string /*, ctx: RichContext*/): string {
  return (
    content
      // user
      // .replaceAll(
      //   /\[PZUser(Mention)?:(\d+)\]/gi,
      //   (_, at: string | undefined, id: string) =>
      //     `[PZUser${at ?? ''}:${id}:${ctx.users?.get(parseInt(id)) ?? id}]`,
      // )
      .replaceAll(
        /\[PZUser(Mention)?:(\d+):(.+?):PZRT\]/gi,
        (_, at: string | undefined, id: string, display: string) =>
          `<a href="/users/${id}" class="richtext-link richtext-user">${
            at ? '@' : ''
          }${display}</a>`,
      )
      // chapter
      .replaceAll(
        /\[PZChapter:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/chapters/${id}" class="richtext-link richtext-chapter">${display}</a>`,
      )
      // song
      .replaceAll(
        /\[PZSong:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/songs/${id}" class="richtext-link richtext-song">${display}</a>`,
      )
      // chart
      .replaceAll(
        /\[PZChart:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/charts/${id}" class="richtext-link richtext-chart">${display}</a>`,
      )
      // comment
      .replaceAll(
        /\[PZComment:([-0-9a-fA-F]+):(.+):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/comments/${id}" class="richtext-link richtext-comment">${display.substring(
            0,
            200,
          )}${display.length > 200 ? '...' : ''}</a>`,
      )
      // reply
      .replaceAll(
        /\[PZReply:([-0-9a-fA-F]+):(.+):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/replies/${id}" class="richtext-link richtext-reply">${display.substring(
            0,
            200,
          )}${display.length > 200 ? '...' : ''}</a>`,
      )
      // song submission
      .replaceAll(
        /\[PZSongSubmission:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/studio/song-submissions/${id}" class="richtext-link richtext-song-upload">${display}</a>`,
      )
      // chart submission
      .replaceAll(
        /\[PZChartSubmission:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/studio/chart-submissions/${id}" class="richtext-link richtext-chart-upload">${display}</a>`,
      )
      // collaboration
      .replaceAll(
        /\[PZCollaboration:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/studio/collaborations/${id}" class="richtext-link richtext-collab">${display}</a>`,
      )
  );
}

export function richtext(content: string /*, api?: API*/): Readable<string> {
  content = preprocess(content);

  // if (api) {
  //   return derived(
  //     [
  //       // users
  //       createQueries(
  //         [
  //           ...new Set(
  //             [...content.matchAll(/\[PZUser(?:Mention)?:(\d+)\]/gi)].map((match) =>
  //               parseInt(match[1]),
  //             ),
  //           ),
  //         ].map((id) => api.user.info({ id })),
  //       ),
  //     ],
  //     ([users]) => {
  //       const ctx: RichContext = {
  //         users: users.reduce((map, query) => {
  //           if (query.isSuccess) map.set(query.data.data.id, query.data.data.userName);
  //           return map;
  //         }, new Map<number, string>()),
  //       };
  //       return transform(content, ctx);
  //     },
  //   );
  // } else {
  return readable(transform(content /*, {}*/));
  // }
}
