export const match: import('@sveltejs/kit').ParamMatcher = (param) => {
    return /^\d+$/.test(param);
};
