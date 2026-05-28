export function isRequired(value) {
  return Boolean(String(value || "").trim());
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isValidPhone(value) {
  return /^\+?[0-9]{10,15}$/.test(String(value || "").trim());
}

export function isValidPassword(value) {
  return String(value || "").length >= 8;
}

export function validateRegisterForm(values) {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = "Name is required";
  }

  if (!isRequired(values.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!isRequired(values.phone)) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Enter a valid phone number";
  }

  if (!isRequired(values.password)) {
    errors.password = "Password is required";
  } else if (!isValidPassword(values.password)) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!isRequired(values.confirm_password)) {
    errors.confirm_password = "Confirm your password";
  } else if (values.password !== values.confirm_password) {
    errors.confirm_password = "Passwords do not match";
  }

  return errors;
}

export function validateOtpForm(values) {
  const errors = {};

  if (!isRequired(values.otp)) {
    errors.otp = "OTP is required";
  } else if (!/^[0-9]{6}$/.test(values.otp)) {
    errors.otp = "Enter the 6-digit OTP";
  }

  return errors;
}