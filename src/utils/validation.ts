
/**
 * Validates ORCID ID format (0000-0000-0000-0000)
 */
export const validateOrcidId = (value: string): boolean => {
  const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
  return orcidPattern.test(value);
};

/**
 * Validates email format
 */
export const validateEmail = (value: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
};

/**
 * Validates that a string is either a valid email or ORCID ID
 */
export const validateIdentifier = (value: string): boolean => {
  return validateEmail(value) || validateOrcidId(value);
};

/**
 * Validates password - must be at least 6 characters
 */
export const validatePassword = (value: string): boolean => {
  return value.length >= 6;
};
