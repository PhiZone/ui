import { browser } from '$app/environment';
import { htmlEscape } from 'escape-goat';
import dompurify from 'dompurify';
import { type Readable, readable } from 'svelte/store';

export function preprocess(content: string): string {
  return htmlEscape(browser ? dompurify.sanitize(content) : content);
}

export function transform(content: string): string {
  return (
    content
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
      // collection
      .replaceAll(
        /\[PZCollection:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/collections/${id}" class="richtext-link richtext-collection">${display}</a>`,
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
      // record
      .replaceAll(
        /\[PZRecord:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/records/${id}" class="richtext-link richtext-chart">${display}</a>`,
      )
      // application
      .replaceAll(
        /\[PZApplication:([-0-9a-fA-F]+):(.+?):PZRT\]/gi,
        (_, id: string, display: string) =>
          `<a href="/applications/${id}" class="richtext-link richtext-chart">${display}</a>`,
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
      // chapter admission
      .replaceAll(
        /\[PZChapterAdmission:([-0-9a-fA-F]+):([-0-9a-fA-F]+):(.+?):PZCRT\]/gi,
        (_, id1: string, id2: string, display: string) =>
          `<a href="/studio/admissions/chapters/${id1}/${id2}" class="richtext-link richtext-admission">${display}</a>`,
      )
      // collection admission
      .replaceAll(
        /\[PZCollectionAdmission:([-0-9a-fA-F]+):([-0-9a-fA-F]+):(.+?):PZCRT\]/gi,
        (_, id1: string, id2: string, display: string) =>
          `<a href="/studio/admissions/collections/${id1}/${id2}" class="richtext-link richtext-admission">${display}</a>`,
      )
      // song admission
      .replaceAll(
        /\[PZSongAdmission:([-0-9a-fA-F]+):([-0-9a-fA-F]+):(.+?):PZCRT\]/gi,
        (_, id1: string, id2: string, display: string) =>
          `<a href="/studio/admissions/songs/${id1}/${id2}" class="richtext-link richtext-admission">${display}</a>`,
      )
      // song submission admission
      .replaceAll(
        /\[PZSongSubmissionAdmission:([-0-9a-fA-F]+):([-0-9a-fA-F]+):(.+?):PZCRT\]/gi,
        (_, id1: string, id2: string, display: string) =>
          `<a href="/studio/admissions/song-submissions/${id1}/${id2}" class="richtext-link richtext-admission">${display}</a>`,
      )
  );
}

export function richtext(content: string): Readable<string> {
  if (!content) return readable('');
  content = preprocess(content);
  return readable(transform(content));
}
