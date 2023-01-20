import type { User } from '$lib/models';
import { locale } from "$lib/translations/config";
import { API_BASE, ContentType } from '$lib/constants';
import { convertLanguageCode } from '$lib/utils';

interface SendOpts<T> {
    method: string;
    path: string;
    data?: T;
    token?: string;
    user?: User;
    contentType?: ContentType;
    func?: Function;
}

function send<T>({ method, path, data, token, user, contentType, func }: SendOpts<T>) {
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
    let l = locale.get();
    headers.append('Accept-Language', (user ? user.language : l ? l : convertLanguageCode(window.navigator.language)).toLowerCase());
    headers.append('User-Agent', 'PhiZoneRegularAccess');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    console.log(path, data);

    if (func) {
        return func(`${API_BASE}${path}`, opts);
    } else {
        return fetch(`${API_BASE}${path}`, opts);
    }
}

export function GET(path: string, token?: string, user?: User, func?: Function) {
    return send<undefined>({ method: 'GET', path, token, user, func });
}

export function DELETE(path: string, token?: string, user?: User, func?: Function) {
    return send<undefined>({ method: 'DELETE', path, token, user, func });
}

export function POST<T>(path: string, data: T, token?: string, user?: User, contentType?: ContentType, func?: Function) {
    return send<T>({ method: 'POST', path, data, token, user, contentType, func });
}

export function PUT<T>(path: string, data: T, token?: string, user?: User, contentType?: ContentType, func?: Function) {
    return send<T>({ method: 'PUT', path, data, token, user, contentType, func });
}

export function HEAD<T>(path: string, data: T, token?: string, user?: User, func?: Function) {
    return send<T>({ method: 'HEAD', path, data, token, user, func });
}

export function PATCH<T>(path: string, data: T, token?: string, user?: User, contentType?: ContentType, func?: Function) {
    return send<T>({ method: 'PATCH', path, data, token, user, contentType, func });
}
