import type { Cookies } from '@sveltejs/kit';
import { USER_LEVELS } from './constants';
import { PUBLIC_AVATAR } from '$env/static/public';

export function parseLatex(input: string) {
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
}

export function getUserPrivilege(type: string | null | undefined) {
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
}

export function convertTime<T>(input: T) {
  let minutes = 0,
    seconds = 0;

  if (typeof input === 'string') {
    const list = input.split(':');
    const hours = parseInt(list[0]);
    minutes = parseInt(list[1]) + hours * 60;
    seconds = parseFloat(list[2]);
  } else if (typeof input === 'number') {
    minutes = Math.floor(input / 60);
    seconds = input % 60;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`;
}

export function parseTime(input: string) {
  const list = input.split(':');
  const hasHour = list.length > 2;
  const hours = hasHour ? parseInt(list[0]) : 0;
  const minutes = parseInt(list[hasHour ? 1 : 0]) + hours * 60;
  const seconds = parseFloat(list[hasHour ? 2 : 1]);
  return minutes * 60 + seconds;
}

export function parseLyrics(input: string) {
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
}

export function parseDateTime(input: string | Date, precise = false) {
  const date = new Date(input);
  if (precise) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

export function parseMonthAndDay(input: string | Date) {
  const date = new Date(input);
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
}

export function getPath(input: string) {
  const url = new URL(input);
  return url.pathname + url.search;
}

export function getCompressedImage(input: string | undefined, quality = 20) {
  return `${input}?imageslim&imageMogr2/quality/${quality}`;
}

export function getUserColor(type: string | null) {
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
}

export function getLevelColor(type: number) {
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
}

export function getUserLevel(exp: number) {
  for (let i = 0; i < USER_LEVELS.length; ++i) {
    if (exp < USER_LEVELS[i].exp) {
      return USER_LEVELS[i].level - 1;
    }
  }
  return USER_LEVELS[USER_LEVELS.length - 1].level;
}

export function getAvatar(avatar: string | null, quality = 15) {
  return getCompressedImage(avatar ?? PUBLIC_AVATAR, quality);
}

export function getGrade(score: number, fullCombo: boolean) {
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
}

export function getLevelDisplay(difficulty: number) {
  if (difficulty === 0) return '?';
  else return Math.floor(difficulty).toString();
}

export function setTokens(cookies: Cookies, accessToken: string, refreshToken: string) {
  cookies.set('access_token', accessToken, {
    path: '/',
    maxAge: 43200,
  });
  cookies.set('refresh_token', refreshToken, {
    path: '/',
    maxAge: 1296000,
  });
}

export function clearTokens(cookies: Cookies) {
  cookies.delete('access_token', { path: '/' });
  cookies.delete('refresh_token', { path: '/' });
}

export function range(start: number, end: number) {
  return [...Array(end - start).keys()].map((x) => x + start);
}

// class Test {
//   constructor(b: number);
//   constructor(a: string, b: number);
//   constructor(ab: number | string, b?: number) {
//     if (b !== undefined) {
//       const a = ab as string;
//       // balabala
//     } else {
//       b = ab as number;
//       // balabala
//     }
//   }
// }
