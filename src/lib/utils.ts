import type { Cookies } from '@sveltejs/kit';
import { USER_LEVELS, defaultLocale } from './constants';
import { PUBLIC_AVATAR } from '$env/static/public';
import type { PatchElement } from './api/types';

export const parseLatex = (input: string) => {
  const result = input.matchAll(/(\$[^$]+\$)/g);
  let element = result.next();
  const latex = [];
  while (element.value) {
    latex.push({
      index: element.value.index,
      text: element.value[0],
      length: element.value[0].length,
    });
    if (element.done) {
      break;
    }
    element = result.next();
  }
  const array = [];
  if (latex.length === 0) {
    array.push({
      latex: false,
      text: input,
    });
    return array;
  }
  let i = 0;
  for (let j = 0; i < input.length && j < latex.length; j++) {
    if (i < latex[j].index) {
      array.push({
        latex: false,
        text: input.substring(i, latex[j].index),
      });
      i = latex[j].index;
    }
    array.push({
      latex: true,
      text: latex[j].text.substring(1, latex[j].length - 1),
    });
    i += latex[j].length;
  }
  if (i < input.length - 1) {
    array.push({
      latex: false,
      text: input.substring(i),
    });
  }
  return array;
};

export const getUserPrivilege = (type: string | null | undefined) => {
  switch (type) {
    case 'Member':
      return 1;
    case 'Sponsor':
      return 2;
    case 'Qualified':
      return 3;
    case 'Volunteer':
      return 4;
    case 'Moderator':
      return 5;
    case 'Administrator':
      return 6;
    default:
      return 0;
  }
};

export const convertTime = <T>(input: T, round = false) => {
  let minutes = 0,
    seconds = 0;

  if (typeof input === 'string') {
    const list = input.split(':');
    const hasHour = list.length > 2;
    const hours = hasHour ? parseInt(list[0]) : 0;
    minutes = parseInt(list[hasHour ? 1 : 0]) + hours * 60;
    seconds = parseFloat(list[hasHour ? 2 : 1]);
  } else if (typeof input === 'number') {
    minutes = Math.floor(input / 60);
    seconds = input % 60;
  }

  return `${minutes.toString().padStart(2, '0')}:${
    round ? Math.round(seconds).toString().padStart(2, '0') : seconds.toFixed(2).padStart(5, '0')
  }`;
};

export const parseTime = (input: string) => {
  const list = input.split(':');
  const hasHour = list.length > 2;
  const hours = hasHour ? parseInt(list[0]) : 0;
  const minutes = parseInt(list[hasHour ? 1 : 0]) + hours * 60;
  const seconds = parseFloat(list[hasHour ? 2 : 1]);
  return minutes * 60 + seconds;
};

export const parseLyrics = (input: string) => {
  const lyrics = [{ time: 0, line: '' }];
  let offset;
  try {
    const offsetResult = input.matchAll(/offset:(\+|-)(\d+)/g).next();
    const sign = offsetResult.value[1],
      value = offsetResult.value[2];
    offset = (sign === '+' ? parseInt(value) : -parseInt(value)) / 1000;
  } catch (e) {
    offset = 0;
  }
  const result = input.matchAll(/\[(\d{2,}):(\d{2}\.\d{2})\]([^\r\n]*)/g);
  let element = result.next();
  while (element.value) {
    lyrics.push({
      time: parseInt(element.value[1]) * 60 + parseFloat(element.value[2]) + offset,
      line: element.value[3],
    });
    if (element.done) {
      break;
    }
    element = result.next();
  }
  return lyrics;
};

export const parseRelativeTime = (date: Date, locale = defaultLocale) => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);

    if (count > 0) {
      return new Intl.RelativeTimeFormat(locale, {
        localeMatcher: 'best fit',
        numeric: 'auto',
        style: 'long',
      }).format(diffInSeconds > 0 ? 0 : -count, interval.label as Intl.RelativeTimeFormatUnit);
    }
  }

  return new Intl.RelativeTimeFormat(locale, {
    localeMatcher: 'best fit',
    numeric: 'auto',
    style: 'long',
  }).format(0, 'second');
};

export const parseDateTime = (
  input: string | Date,
  relative = false,
  locale = defaultLocale,
  precise = false,
) => {
  const date = new Date(input);
  if (precise) {
    return date.toLocaleString();
  }
  return relative
    ? parseRelativeTime(date, locale)
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
};

export const parseMonthAndDay = (input: string | Date) => {
  const date = new Date(input);
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
};

export const getPath = (input: string) => {
  const url = new URL(input);
  return url.pathname + url.search;
};

export const getCompressedImage = (input: string | undefined, quality = 20) => {
  return input ? `${input}?imageslim&imageMogr2/quality/${quality}` : undefined;
};

export const getUserColor = (type: string | null) => {
  switch (type) {
    case 'Member':
      return 'neutral-500';
    case 'Sponsor':
      return 'amber-500';
    case 'Qualified':
      return 'teal-500';
    case 'Volunteer':
      return 'orange-500';
    case 'Moderator':
      return 'emerald-500';
    case 'Administrator':
      return 'indigo-500';
    default:
      return 'stone-500';
  }
};

export const getLevelColor = (type: number) => {
  switch (type) {
    case 0:
      return 'btn-info';
    case 1:
      return 'btn-warning';
    case 2:
      return 'btn-primary';
    case 3:
      return '';
    default:
      return 'btn-accent';
  }
};

export const getUserLevel = (exp: number) => {
  for (let i = 0; i < USER_LEVELS.length; ++i) {
    if (exp < USER_LEVELS[i].exp) {
      return USER_LEVELS[i].level - 1;
    }
  }
  return USER_LEVELS[USER_LEVELS.length - 1].level;
};

export const getAvatar = (avatar: string | null, quality = 15) => {
  return getCompressedImage(avatar ?? PUBLIC_AVATAR, quality);
};

export const getGrade = (score: number, fullCombo: boolean) => {
  if (score === 1000000) {
    return 'P';
  }
  if (score >= 960000 || fullCombo) {
    return 'V';
  }
  if (score >= 920000) {
    return 'S';
  }
  if (score >= 880000) {
    return 'A';
  }
  if (score >= 820000) {
    return 'B';
  }
  if (score >= 700000) {
    return 'C';
  }
  return 'F';
};

export const getLevelDisplay = (difficulty: number) => {
  if (difficulty === 0) return '?';
  else return Math.floor(difficulty).toString();
};

export const setTokens = (cookies: Cookies, accessToken: string, refreshToken: string) => {
  cookies.set('access_token', accessToken, {
    path: '/',
    maxAge: 21600,
  });
  cookies.set('refresh_token', refreshToken, {
    path: '/',
    maxAge: 1209600,
  });
};

export const clearTokens = (cookies: Cookies) => {
  cookies.delete('access_token', { path: '/' });
  cookies.delete('refresh_token', { path: '/' });
};

export const parseAcceptLanguage = (acceptLanguageHeader: string | null): string[] => {
  if (!acceptLanguageHeader) {
    return [];
  }

  const languageTags = acceptLanguageHeader
    .split(',')
    .map((language) => {
      const [tag, q] = language.trim().split(';q=');
      const quality = q ? parseFloat(q) : 1.0;
      return { tag, quality };
    })
    .filter(({ tag }) => tag !== '*')
    .sort((a, b) => b.quality - a.quality)
    .map(({ tag }) => tag);
  return languageTags;
};

export const range = (start: number, end: number) => {
  return [...Array(end - start).keys()].map((x) => x + start);
};

export const applyPatch = (
  patch: PatchElement[],
  op: 'add' | 'replace' | 'remove',
  path: string,
  value?: unknown,
) => {
  const i = patch.findIndex((value) => value.path === path);
  if (i === -1) {
    patch.push({ op, path, value });
  } else {
    patch[i] = { op, path, value };
  }
  return patch;
};

export const toCamel = (inputString: string): string =>
  inputString.length > 0 ? inputString[0].toLowerCase() + inputString.slice(1) : inputString;
