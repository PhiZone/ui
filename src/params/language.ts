export const match = (param) => {
  return /^[a-z]{2}(?:-[A-Z]{2})?$/i.test(param);
};
