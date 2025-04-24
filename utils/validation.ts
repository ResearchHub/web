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

export const isValidListName = (name: string): boolean => {
  return name.trim().length > 0 && name.length < 200;
};

export const isValidListItemName = (name: string): boolean => {
  return name.trim().length > 0 && name.length < 200;
};
