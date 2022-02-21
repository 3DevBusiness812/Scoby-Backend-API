export const JWT_ERRORS = {
  INVALID_JWT_TYPE: {
    CODE: 'ERR_INVALID_JWT_TYPE',
    MESSAGE: 'Invalid JWT type has been provided',
  },
  JWT_ISSUE_FAILED: {
    CODE: 'ERR_JWT_ISSUE_FAILED',
    MESSAGE: 'Failed to issue JWT token',
  },
  JWT_INVALID_OR_EXPIRED: {
    CODE: 'ERR_JWT_INVALID_OR_EXPIRED',
    MESSAGE: 'JWT token is invalid or expired',
  },
  UNAUTHORIZED: {
    CODE: 'ERR_UNAUTHORIZED',
    MESSAGE: 'Unauthorized user',
  },
  INVALID_AUTHORIZATION_HEADER: {
    CODE: 'ERR_INVALID_AUTHORIZATION_HEADER',
    MESSAGE: 'Invalid authorization header',
  },
};
