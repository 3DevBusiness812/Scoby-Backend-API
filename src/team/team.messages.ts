export const TEAM_ERRORS = {
  UNIQUE_INVITED_USERS: 'Array of users should contain unique values',
  TEAM_NOT_FOUND: {
    CODE: 'ERR_TEAM_NOT_FOUND',
    MESSAGE: 'Team not found',
  },
  TEAM_FINISHED: {
    CODE: 'ERR_TEAM_FINISHED',
    MESSAGE: 'Team has been finished',
  },
  NOT_TEAM_OWNER: {
    CODE: 'ERR_NOT_TEAM_OWNER',
    MESSAGE: 'User is not owner of the team',
  },
  WRONG_REQUEST_PAYLOAD: {
    CODE: 'WRONG_REQUEST_PAYLOAD',
    MESSAGE: 'Wrong request payload',
  },
  NOT_ALLOWED_TO_INVITE: {
    CODE: 'NOT_ALLOWED_TO_INVITE',
    MESSAGE: 'User is not allowed to invite members to this team',
  },
  USER_ALREADY_INVITED: {
    CODE: 'USER_ALREADY_INVITED',
    MESSAGE: 'User or users already invited',
  },
  EDIT_ACCESS_RESTRICTED: {
    CODE: 'EDIT_ACCESS_RESTRICTED',
    MESSAGE: "User don't have access to edit this team",
  },
  DELETE_ACCESS_RESTRICTED: {
    CODE: 'DELETE_ACCESS_RESTRICTED',
    MESSAGE: "User don't have access to delete this team",
  },
  DELETE_REQUEST_RESTRICTED: {
    CODE: 'DELETE_REQUEST_RESTRICTED',
    MESSAGE: 'Can`t delete request',
  },
  JOIN_REQUEST_RESTRICTED: {
    CODE: 'JOIN_REQUEST_RESTRICTED',
    MESSAGE: 'User already requested',
  },
  ACCEPT_INVITE_RESTRICTED: {
    CODE: 'DELETE_JOIN_REQUEST_RESTRICTED',
    MESSAGE: 'User is not requested',
  },
  APPROVE_INVITE_RESTRICTED: {
    CODE: 'APPROVE_INVITE_RESTRICTED',
    MESSAGE: "You don't have access to approve this request"
  },
  USER_IS_ALREADY_MEMBER: {
    CODE: 'USER_IS_ALREADY_MEMBER',
    MESSAGE: "User is already an member"
  }
};
