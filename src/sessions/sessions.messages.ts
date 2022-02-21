export const SESSIONS_ERRORS = {
  SESSION_NOT_FOUND: {
    CODE: 'ERR_SESSION_NOT_FOUND',
    MESSAGE: 'Session not found',
  },

  SESSION_FINISHED: {
    CODE: 'ERR_SESSION_FINISHED',
    MESSAGE: 'Session has been finished',
  },
  NOT_SESSION_OWNER: {
    CODE: 'ERR_NOT_SESSION_OWNER',
    MESSAGE: 'User is not owner of the session',
  },
  USER_BLOCKED: {
    CODE: 'ERR_USER_BLOCKED',
    MESSAGE: 'User has been blocked for session',
  },
  ACCESS_RESTRICTED: {
    CODE: 'ACCESS_RESTRICTED',
    MESSAGE: 'This Session is private'
  },

};
