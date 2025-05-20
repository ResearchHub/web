export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};

const MAX_LIST_NAME_LENGTH = 200;

export const isValidListName = (name: string, lists: string[]): boolean => {
  return name.trim().length > 0 && name.length < MAX_LIST_NAME_LENGTH && !lists.includes(name);
};

export const isValidListItemName = (name: string): boolean => {
  return name.trim().length > 0 && name.length < MAX_LIST_NAME_LENGTH;
};
