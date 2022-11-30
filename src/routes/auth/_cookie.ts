import { serialize } from 'cookie';

export function setTokens(access_token: string, refresh_token: string) {
    // return [
    //     ['Set-Cookie', `access_token=${access_token}; Path=/; Max-Age=43200`],
    //     ['set-cookie', `refresh_token=${refresh_token}; Path=/; Max-Age=1296000`],
    // ];
    return new Headers([
        [
            'Set-Cookie',
            serialize('access_token', access_token, {
                path: '/',
                maxAge: 43200,
            }),
        ],
        [
            'Set-Cookie',
            serialize('refresh_token', refresh_token, {
                path: '/',
                maxAge: 1296000,
            }),
        ],
    ]);
}

export function clearTokens() {
    // return [
    //     ['set-cookie', 'access_token=deleted; Max-Age=0'],
    //     ['set-cookie', 'refresh_token=deleted; Max-Age=0'],
    // ];
    return new Headers([
        [
            'Set-Cookie',
            serialize('access_token', '', {
                path: '/',
                maxAge: 0,
            }),
        ],
        [
            'Set-Cookie',
            serialize('refresh_token', '', {
                path: '/',
                maxAge: 0,
            }),
        ],
    ]);
}
