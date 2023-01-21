import { LOCAL_API_BASE, RES_BASE, USER_LEVELS } from "./constants";

export function POST(endpoint: string, data: unknown, language?: string) {
    return fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data || {}),
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'PhiZoneRegularAccess',
            'Accept-Language': (language ? language : convertLanguageCode(window.navigator.language)).toLowerCase()
        },
    });
}

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

export function getUserPrivilege(type: string | undefined) {
    switch (type) {
        case 'banned':
            return 0;
        case 'member':
            return 1;
        case 'qualified':
            return 2;
        case 'volunteer':
            return 3;
        case 'admin':
            return 4;
        default:
            return -1;
    }
}

export function convertDuration<T>(input: T) {
    let minutes = 0,
        seconds = 0;

    if (typeof input === 'string') {
        const list = input.split(':');
        const hours = parseInt(list[0]);
        minutes = parseInt(list[1]) + hours * 60;
        seconds = parseInt(list[2]);
    } else if (typeof input === 'number') {
        const num = Math.floor(input);
        minutes = Math.floor(num / 60);
        seconds = num % 60;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function parseDuration(input: string) {
    const list = input.split(':');
    const hours = parseInt(list[0]);
    const minutes = parseInt(list[1]) + hours * 60;
    const seconds = parseInt(list[2]);
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

export function parseRichText(input: string) {
    const result = input.matchAll(new RegExp(`\\[PZ([A-Za-z]+):([0-9]+):([^\\]]+)\\]`, 'g'));
    let element = result.next();
    const rich = [];
    while (element.value) {
        rich.push({
            index: element.value.index,
            text: element.value[0],
            type: element.value[1],
            id: element.value[2],
            display: element.value[3],
            length: element.value[0].length,
        });
        if (element.done) {
            break;
        }
        element = result.next();
    }
    const array: { type?: string, id: number, text: string }[] = [];
    if (rich.length === 0) {
        array.push({
            type: undefined,
            id: 0,
            text: input,
        });
        return array;
    }
    let i = 0;
    for (let j = 0; i < input.length && j < rich.length; j++) {
        if (i < rich[j].index) {
            array.push({
                type: undefined,
                id: 0,
                text: input.substring(i, rich[j].index),
            });
            i = rich[j].index;
        }
        array.push({
            type: rich[j].type,
            id: rich[j].id,
            text: rich[j].display,
        });
        i += rich[j].length;
    }
    if (i < input.length - 1) {
        array.push({
            type: undefined,
            id: 0,
            text: input.substring(i),
        });
    }
    return array;
}

export function convertLanguageCode(input: string) {
    const text = input.toLowerCase();
    if (text.startsWith('zh')) {
        return text.endsWith('cn') || text.endsWith('sg') || text.endsWith('hans') ? 'zh-Hans' : 'zh-Hant';
    }
    return input.split('-')[0];
}

export function parseDateTime(input: string) {
    const date = new Date(input);
    return date.toLocaleString();
}

export function parseMonthAndDay(input: string) {
    const date = new Date(input);
    return date.toLocaleDateString(undefined, {
        month: "long", day: "numeric"
    });
}

export function getPath(input: string) {
    const url = new URL(input);
    return url.pathname + url.search;
}

export function getCompressedImage(input: string | undefined) {
    if (!input) {
        return "";
    }
    return input.replace(/^http[^ ]+media$/g, RES_BASE).replace(/\.(png)|(jpe?g)|(webp)$/gi, ".comp.webp");
}

export function getUserColor(type: string | undefined) {
    switch (type) {
        case 'banned':
            return "stone-800";
        case 'member':
            return "neutral-500";
        case 'qualified':
            return "teal-500";
        case 'volunteer':
            return "emerald-500";
        case 'admin':
            return "indigo-500";
        default:
            return "neutral-500";
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

export function getGrade(score: number, fullCombo: boolean) {
    if (score === 1000000) {
        return "P";
    }
    if (score >= 960000 || fullCombo) {
        return "V";
    }
    if (score >= 920000) {
        return "S";
    }
    if (score >= 880000) {
        return "A";
    }
    if (score >= 820000) {
        return "B";
    }
    if (score >= 700000) {
        return "C";
    }
    return "F";
}