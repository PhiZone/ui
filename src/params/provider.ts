import { SUPPORTED_APPS } from '$lib/constants';

export const match = (param) => {
  return SUPPORTED_APPS.map((value) => value.toLowerCase()).includes(param.toLowerCase());
};
