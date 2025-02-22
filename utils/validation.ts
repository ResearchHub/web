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

interface ValidationErrors {
  title?: string;
  budget?: string;
  [key: string]: string | undefined;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export function validatePreregistration(
  title: string | undefined,
  fundingData: { budget: string }
): ValidationResult {
  const errors: ValidationErrors = {};

  // Validate title
  if (!title) {
    errors.title = 'Please add a title to your research';
  } else if (title.trim().length < 20) {
    errors.title = 'Title must be at least 20 characters long';
  }

  // Validate budget
  const budget = parseFloat(fundingData.budget.replace(/[^0-9.]/g, ''));
  if (!budget || budget <= 0) {
    errors.budget = 'Please set a valid funding goal';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
