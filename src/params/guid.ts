export const match = (param) => {
  return /^[a-f\d]{4}(?:[a-f\d]{4}-){4}[a-f\d]{12}$/i.test(param);
};
