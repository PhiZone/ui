export const load = async ({ cookies }) => {
  return { preferredApplication: cookies.get('preferred_application') };
};
