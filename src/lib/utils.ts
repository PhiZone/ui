import type { Cookies } from '@sveltejs/kit';
import type { ParsedQuery } from 'query-string';

import { micromark } from 'micromark';
import { math, mathHtml } from 'micromark-extension-math';
import queryString from 'query-string';

import { PUBLIC_AVATAR } from '$env/static/public';

import type API from './api';
import type { UserDetailedDto } from './api';
import type { EventDto } from './api/event';
import type { PatchElement } from './api/types';

import { DEFAULT_LOCALE, USER_LEVELS } from './constants';
import { gen, hasPermission } from './hostshipPermissions';

export const renderMarkdown = (input: string) => {
  return micromark(input, {
    extensions: [math()],
    htmlExtensions: [mathHtml()],
  });
};

export const getUserPrivilege = (role: string | null | undefined) => {
  switch (role) {
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

export const isEventHost = (user: UserDetailedDto | undefined, event: EventDto | undefined) => {
  return (
    user &&
    event &&
    (getUserPrivilege(user.role) === 6 || user.hostships.some((e) => e.eventId === event.id))
  );
};

export const hasEventPermission = (
  user: UserDetailedDto | undefined,
  event: EventDto | undefined,
  operation?: number | undefined,
  scope?: number | undefined,
  index?: number | undefined,
) => {
  return (
    !!user &&
    !!event &&
    (getUserPrivilege(user.role) === 6 ||
      user.hostships.some(
        (e) =>
          e.eventId === event.id &&
          (e.isAdmin ||
            (operation !== undefined &&
              scope !== undefined &&
              hasPermission(e, gen(operation, scope, index)))),
      ))
  );
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
    if (offsetResult.value) {
      const sign = offsetResult.value[1],
        value = offsetResult.value[2];
      offset = (sign === '+' ? parseInt(value) : -parseInt(value)) / 1000;
    } else {
      offset = 0;
    }
  } catch {
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

export const parseRelativeTime = (date: Date, locale = DEFAULT_LOCALE) => {
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
      }).format(diffInSeconds > 0 ? count : -count, interval.label as Intl.RelativeTimeFormatUnit);
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
  locale = DEFAULT_LOCALE,
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

export const parseMonthAndDay = (input: string) => {
  return toLocalTime(input).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
};

export const toLocalTime = (input: string) => {
  return new Date(input.split('+')[0]);
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

export const getLevelColor = (type: number | undefined) => {
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
  for (const level of USER_LEVELS) {
    if (exp < level.exp) {
      return level.level - 1;
    }
  }
  return USER_LEVELS[USER_LEVELS.length - 1].level;
};

export const getAvatar = (avatar: string | undefined | null, quality = 15) => {
  return getCompressedImage(avatar ?? PUBLIC_AVATAR, quality);
};

export const getFileType = (mime: string, fileName: string) => {
  const extension = fileName.toLowerCase().split('.').pop() ?? '';
  const isShader = [
    'shader',
    'metal',
    'glsl',
    'hlsl',
    'wgsl',
    'frag',
    'spv',
    'cg',
    'fs',
    'fx',
  ].includes(extension);
  if (mime.startsWith('image/')) {
    return 0;
  }
  if (mime.startsWith('audio/')) {
    return 1;
  }
  if (mime.startsWith('video/')) {
    return 2;
  }
  if (
    (!isShader && mime.startsWith('text/')) ||
    mime === 'application/json' ||
    ['yml', 'yaml'].includes(extension)
  ) {
    return 3;
  }
  return isShader ? 4 : 5;
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

export const getLevelDisplay = (difficulty: number | string | undefined) => {
  if (difficulty === undefined) return undefined;
  if (typeof difficulty === 'string') difficulty = parseFloat(difficulty);
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

export const parseFile = async (url: string, fileName: string, type: string): Promise<File> => {
  return new File([await (await fetch(url)).blob()], fileName, { type });
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

export const getAppUserLink = (app: string, user: string) => {
  switch (app.toLowerCase()) {
    case 'github':
      return `https://github.com/${user}`;
    case 'phira':
      return `https://phira.moe/user/${user}`;
    default:
      return null;
  }
};

export const requestIdentity = async (
  provider: string,
  api: API,
  bind = false,
  register = false,
) => {
  const state = Math.random().toString(36).substring(2);
  const params = new URLSearchParams();
  if (bind) params.append('bind', 'true');
  if (register) params.append('register', 'true');
  const resp = await api.auth.provider({
    provider: provider.toLowerCase(),
    state,
    redirectUri: `${location.origin}/session/callback/${provider.toLowerCase()}${
      params.size > 0 ? `?${params.toString()}` : ''
    }`,
  });
  if (resp.ok) {
    const data = (await resp.json()).data;
    if (data.type === 2 && data.redirectUri) window.open(data.redirectUri, '_blank');
  } else {
    console.error(
      `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
      await resp.json(),
    );
  }
};

export const convertToParsedQuery = (
  params: URLSearchParams,
): ParsedQuery<string | number | boolean> => {
  const parsed = queryString.parse(params.toString(), {
    parseBooleans: true,
    parseNumbers: true,
  });

  return parsed as ParsedQuery<string | number | boolean>;
};

export const snakeToCamel = (input: string) => {
  const arr = input.split('_');

  return arr
    .map((word, index) => {
      if (index !== 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join('');
};

const base72Charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-_.+!*'(),";

export const guidToBase72 = (guid: string): string => {
  const hexString = guid.replace(/-/g, '');
  let bigIntValue = BigInt(`0x${hexString}`);

  let base72String = '';
  const base = BigInt(72);

  while (bigIntValue > 0) {
    const remainder = bigIntValue % base;
    base72String = base72Charset[Number(remainder)] + base72String;
    bigIntValue = bigIntValue / base;
  }

  return base72String || '0';
};

export const base72ToGuid = (base72String: string): string => {
  const charToValueMap: Record<string, number> = {};
  for (let i = 0; i < base72Charset.length; i++) {
    charToValueMap[base72Charset[i]] = i;
  }

  let bigIntValue = BigInt(0);
  const base = BigInt(72);

  for (const char of base72String) {
    const value = BigInt(charToValueMap[char]);
    bigIntValue = bigIntValue * base + value;
  }

  const hexString = bigIntValue.toString(16).padStart(32, '0');
  const guid = `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20, 32)}`;

  return guid;
};
