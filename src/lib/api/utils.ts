import type {User} from '$lib/models';
import { ContentType } from '$lib/constants';

export const API_BASE = 'http://localhost:8000';

interface SendOpts<T> {
    method: string;
    path: string;
    data?: T;
    token?: string;
    user?: User;
    contentType?: string;
}

function send<T>({ method, path, data, token, user, contentType }: SendOpts<T>) {
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
    if (user) {
        headers.append('Accept-Language', user.language.toLowerCase())
    }
    console.log(path, data);

    return fetch(`${API_BASE}/${path}`, opts);
}

export function GET(path: string, token?: string, user?: User) {
    return send<undefined>({ method: 'GET', path, token, user });
}

export function DELETE(path: string, token?: string, user?: User) {
    return send<undefined>({ method: 'DELETE', path, token, user });
}

export function POST<T>(path: string, data: T, token?: string, user?: User, contentType?: string) {
    return send<T>({ method: 'POST', path, data, token, user, contentType });
}

export function PUT<T>(path: string, data: T, token?: string, user?: User) {
    return send<T>({ method: 'PUT', path, data, token, user });
}

export function HEAD<T>(path: string, data: T, token?: string, user?: User) {
    return send<T>({ method: 'HEAD', path, data, token, user });
}

export function PATCH<T>(path: string, data: T, token?: string, user?: User) {
    return send<T>({ method: 'PATCH', path, data, token, user });
}
