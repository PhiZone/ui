export const load = async ({ url, parent }) => {
  const { api } = await parent();
  const token = url.searchParams.get('token') as string;
  if (token) {
    const resp = await api.session.password_reset.validate({ token });
    if (!resp.ok) {
      const err = await resp.json();
      return { token, detail: err.detail };
    }

    return { token };
  }
};
