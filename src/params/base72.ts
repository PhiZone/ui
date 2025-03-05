export const match = (param) => {
  return /^[0-9a-zA-Z$\-_.+!*'(),]{1,21}$/.test(param);
};
