import { Alert } from "react-native";

export const showErrorAlert = (error, title = "Error") => {
  let errorMessage = "An unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && error.message) {
    errorMessage = error.message;
  }

  if (errorMessage.includes("email")) {
    if (errorMessage.toLowerCase().includes("already exists")) {
      errorMessage =
        "This email is already registered. Please use a different email or try signing in.";
    } else if (errorMessage.toLowerCase().includes("invalid")) {
      errorMessage = "Please enter a valid email address.";
    }
  } else if (errorMessage.includes("password")) {
    if (errorMessage.toLowerCase().includes("too short")) {
      errorMessage = "Password must be at least 6 characters long.";
    } else if (errorMessage.toLowerCase().includes("too weak")) {
      errorMessage =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
    } else if (errorMessage.toLowerCase().includes("invalid")) {
      errorMessage =
        "Invalid password. Please check your password and try again.";
    }
  } else if (errorMessage.includes("name")) {
    if (errorMessage.toLowerCase().includes("too short")) {
      errorMessage = "Name must be at least 2 characters long.";
    } else if (errorMessage.toLowerCase().includes("invalid")) {
      errorMessage = "Please enter a valid name (letters only).";
    }
  }

  Alert.alert(
    title,
    errorMessage,
    [
      {
        text: "OK",
        style: "default",
      },
    ],
    { cancelable: false }
  );
};

export const showSuccessAlert = (
  message,
  title = "Success",
  onPress = null
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: "OK",
        style: "default",
        onPress: onPress,
      },
    ],
    { cancelable: false }
  );
};

export const showConfirmationAlert = (
  message,
  title = "Confirm",
  onConfirm = null,
  onCancel = null,
  confirmText = "Yes",
  cancelText = "Cancel"
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: "cancel",
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: "default",
        onPress: onConfirm,
      },
    ],
    { cancelable: false }
  );
};

// Validation helper functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

export const validateName = (name) => {
  // At least 2 characters, letters and spaces only
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name.trim());
};

// Client-side validation with user-friendly messages
export const validateUserData = (userData) => {
  const errors = [];

  if (!userData.name || !userData.name.trim()) {
    errors.push("Name is required");
  } else if (!validateName(userData.name)) {
    errors.push("Name must be at least 2 characters and contain only letters");
  }

  if (!userData.email || !userData.email.trim()) {
    errors.push("Email is required");
  } else if (!validateEmail(userData.email.trim())) {
    errors.push("Please enter a valid email address");
  }

  if (!userData.password || !userData.password.trim()) {
    errors.push("Password is required");
  } else if (userData.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCredentials = (credentials) => {
  const errors = [];

  if (!credentials.email || !credentials.email.trim()) {
    errors.push("Email is required");
  } else if (!validateEmail(credentials.email.trim())) {
    errors.push("Please enter a valid email address");
  }

  if (!credentials.password || !credentials.password.trim()) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
