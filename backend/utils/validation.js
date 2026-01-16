// Validation utilities for production-ready API

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password) => {
  // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letters");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain numbers");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain special characters (!@#$%^&*)");
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateNoteInput = (title, contents) => {
  const errors = [];
  
  if (!title || title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (title.length > 500) {
    errors.push("Title must not exceed 500 characters");
  }
  if (contents && contents.length > 50000) {
    errors.push("Note content must not exceed 50,000 characters");
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validatePagination = (page, limit) => {
  const errors = [];
  
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  
  if (pageNum < 1) {
    errors.push("Page must be >= 1");
  }
  if (limitNum < 1 || limitNum > 100) {
    errors.push("Limit must be between 1 and 100");
  }
  
  return { 
    isValid: errors.length === 0, 
    errors, 
    page: Math.max(1, pageNum),
    limit: Math.min(Math.max(1, limitNum), 100)
  };
};
