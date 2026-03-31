/**
 * Form Validation Utilities
 * Centralized validation functions for forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * - Minimum 6 characters
 * - At least one uppercase letter (optional, for higher security)
 * - At least one number (optional, for higher security)
 */
export const validatePassword = (
  password: string,
  options?: { requireUppercase?: boolean; requireNumber?: boolean }
): boolean => {
  if (password.length < 6) return false;

  if (options?.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (options?.requireNumber && !/[0-9]/.test(password)) return false;

  return true;
};

/**
 * Validate name field
 * - Minimum 2 characters
 * - No numbers (optional)
 */
export const validateName = (name: string): boolean => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  // Allow names with numbers
  return true;
};

/**
 * Validate login form
 */
export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!validatePassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate signup form
 */
export const validateSignupForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (!validateName(name)) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!validatePassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  } else if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], fieldName: string): string | null => {
  const error = errors.find((e) => e.field === fieldName);
  return error ? error.message : null;
};

/**
 * Check if a field has errors
 */
export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some((e) => e.field === fieldName);
};
