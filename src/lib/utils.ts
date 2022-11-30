export function POST(endpoint: string, data: unknown) {
    return fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(data || {}),
        headers: {
            'Content-Type': 'application/json',
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

export function parseCharter(input: string) {
    const result = input.matchAll(/\[PZUser:([0-9]+):([^\]]+)\]/g);
    let element = result.next();
    const charter = [];
    while (element.value) {
        charter.push({
            index: element.value.index,
            text: element.value[0],
            id: element.value[1],
            nickname: element.value[2],
            length: element.value[0].length,
        });
        if (element.done) {
            break;
        }
        element = result.next();
    }
    const array = [];
    if (charter.length === 0) {
        array.push({
            id: 0,
            text: input,
        });
        return array;
    }
    let i = 0;
    for (let j = 0; i < input.length && j < charter.length; j++) {
        if (i < charter[j].index) {
            array.push({
                id: 0,
                text: input.substring(i, charter[j].index),
            });
            i = charter[j].index;
        }
        array.push({
            id: charter[j].id,
            text: charter[j].nickname,
        });
        i += charter[j].length;
    }
    if (i < input.length - 1) {
        array.push({
            id: 0,
            text: input.substring(i),
        });
    }
    return array;
}

export function convertLanguageCode(input: string) {
    const text = input.toLowerCase();
    if (text.startsWith('zh')) {
        return text.endsWith('cn') || text.endsWith('hans') ? 'zh-Hans' : 'zh-Hant';
    }
    return input;
}

export function parseDateTime(input: string) {
    const date = new Date(input);
    return date.toLocaleString()
}