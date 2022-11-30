export const load: import('./$types').PageLoad = async ({ url }) => {
    return {
        redirect: url.searchParams.get('redirec'),
    };
};
