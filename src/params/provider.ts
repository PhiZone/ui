import { SUPPORTED_APPS } from '$lib/constants';

export const match = (param) => {
  return !!SUPPORTED_APPS.find((a) => a.name.toLowerCase() === param.toLowerCase());
};
