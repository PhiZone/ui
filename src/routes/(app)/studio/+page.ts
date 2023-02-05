import * as api from '$lib/api';

export const load: import('./$types').PageLoad = async ({ fetch }) => {
    const resp = await api.GET("/studio_headline/", undefined, undefined, fetch);
    let json;
    if (resp.status === 200) {
        json = await resp.json();
    }
    return {
        status: resp.status,
        content: json,
    };
};
