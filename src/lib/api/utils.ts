import { ContentType } from '$lib/constants';

export const API_BASE = 'http://localhost:8000';

interface SendOpts<T> {
    method: string;
    path: string;
    data?: T;
    token?: string;
    contentType?: string;
}

function send<T>({ method, path, data, token, contentType }: SendOpts<T>) {
    const headers = new Headers();
    const opts: RequestInit = { method, headers };

    if (data) {
        if (contentType && contentType === ContentType.FORM_DATA && data instanceof FormData) {
            opts.body = data;
        } else {
            headers.append('Content-Type', ContentType.JSON);
            opts.body = JSON.stringify(data);
        }
    }

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    console.log(path, data);

    return fetch(`${API_BASE}/${path}`, opts);
}

export function GET(path: string, token?: string) {
    return send<undefined>({ method: 'GET', path, token });
}

export function DELETE(path: string, token?: string) {
    return send<undefined>({ method: 'DELETE', path, token });
}

export function POST<T>(path: string, data: T, token?: string, contentType?: string) {
    return send<T>({ method: 'POST', path, data, token, contentType });
}

export function PUT<T>(path: string, data: T, token?: string) {
    return send<T>({ method: 'PUT', path, data, token });
}

export function HEAD<T>(path: string, data: T, token?: string) {
    return send<T>({ method: 'HEAD', path, data, token });
}

export function PATCH<T>(path: string, data: T, token?: string) {
    return send<T>({ method: 'PATCH', path, data, token });
}
