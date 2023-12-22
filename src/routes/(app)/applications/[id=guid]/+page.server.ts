export const load = async ({ params, url, cookies }) => {
  const preferredApplication = url.searchParams.get('preferred');
  if (preferredApplication) {
    if (preferredApplication == '1') {
      cookies.set('preferred_application', params.id, { path: '/' });
    } else {
      cookies.delete('preferred_application', { path: '/' });
    }
  }
  return { preferredApplication: cookies.get('preferred_application') };
};
