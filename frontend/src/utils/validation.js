/**
 * Form Validation Utilities
 * Centralized validation functions for forms
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * - Minimum 6 characters
 * - At least one uppercase letter (optional)
 * - At least one number (optional)
 */
export const validatePassword = (password, options = {}) => {
  if (password.length < 6) return false;
  if (options.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (options.requireNumber && !/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Validate name field
 * - Minimum 2 characters
 */
export const validateName = (name) => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  return true;
};

/**
 * Validate login form
 */
export const validateLoginForm = (email, password) => {
  const errors = [];

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
export const validateSignupForm = (email, password, name, confirmPassword) => {
  const errors = [];

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
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
  } else if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
