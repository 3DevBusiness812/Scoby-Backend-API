export const USERS_ERRORS = {
  USER_EXISTS: {
    CODE: 'ERR_USER_EXISTS',
    MESSAGE: 'User has been already registered',
  },
  USER_NOT_FOUND: {
    CODE: 'ERR_USER_NOT_FOUND',
    MESSAGE: 'User not found',
  },
  WRONG_REGISTRATION_STEP: {
    CODE: 'ERR_WRONG_REGISTRATION_STEP',
    MESSAGE: 'Wrong user registration step',
  },
  INVALID_VERIFICATION_CODE: {
    CODE: 'ERR_INVALID_VERIFICATION_CODE',
    MESSAGE: 'Invalid verification code',
  },
  VERIFICATION_CODE_EXPIRED: {
    CODE: 'ERR_VERIFICATION_CODE_EXPIRED',
    MESSAGE: 'Verification code has expired',
  },
  USERNAME_EXISTS: {
    CODE: 'ERR_USERNAME_EXISTS',
    MESSAGE: 'Username has been already taken by another user',
  },
  INCORRECT_PHONE_OR_PASSWORD: {
    CODE: 'ERR_INCORRECT_PHONE_OR_PASSWORD',
    MESSAGE: 'Incorrect user phone number or password',
  },
  INCORRECT_USERNAME_OR_PASSWORD: {
    CODE: 'ERR_INCORRECT_USERNAME_OR_PASSWORD',
    MESSAGE: 'Incorrect username or password',
  },
  INVALID_USER: {
    CODE: 'ERR_INVALID_USER',
    MESSAGE: 'Invalid user specified',
  },
  EMAIL_EXISTS: {
    CODE: 'ERR_EMAIL_EXISTS',
    MESSAGE: 'User email has been already registered',
  },
  UNABLE_FOLLOW_YOURSELF: {
    CODE: 'ERR_UNABLE_FOLLOW_YOURSELF',
    MESSAGE: 'Unable to follow yourself',
  },
  UNABLE_UNFOLLOW_YOURSELF: {
    CODE: 'ERR_UNABLE_UNFOLLOW_YOURSELF',
    MESSAGE: 'Unable to unfollow yourself',
  },
  REQUEST_FAILED: {
    CODE: 'ERR_REQUEST_FAILED',
    MESSAGE: 'Request failed',
  },
  VERIFICATION_CODE_LIMIT: {
    CODE: 'ERR_VERIFICATION_CODE_LIMIT',
    MESSAGE: 'You have requested many verification codes ',
  },
  WRONG_PHONE_NUMBER: {
    CODE: 'ERR_WRONG_PHONE_NUMBER',
    MESSAGE: 'Invalid phone number',
  },
};

export const USERS_VALIDATION_MESSAGES = {
  PASSWORD_PATTERN:
    '{#label} must have at least 1 uppercase, 1 lowercase and 1 number',
  USERNAME_PATTERN: '{#label} must be alphanumeric characters, dots and dashes',
  PHONE_PATTERN: '{#label} must be international phone format +XXXXXXXXXXXXX',
  VERIFICATION_CODE_PATTERN: '{#label} must be 4 digit characters XXXX',
};

export const usersParamsMessages = {
  createUserSmsVerification: (code: string): string =>
    `Your user registration verification code ${code}`,
  resetPasswordSmsVerification: (code: string): string =>
    `Your password reset verification code ${code}`,
};
