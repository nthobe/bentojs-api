'use strict';

let error = Bento.Error;

module.exports = {

  /**
   * Returns a missing configuration error.
   * @return {Object}
   */
  missingConfiguration() {
    return error.parse({
      code     : `AUTH_CONFIGURATION_MISSING`,
      message  : `Missing authentication configuration.`,
      solution : `Make sure you have defined [default] and/or ${ Bento.ENV } configuration for authentication.`
    });
  },

  /**
   * Returns an invalid user session error.
   * @return {Object}
   */
  invalidUserSession() {
    return error.parse({
      code     : `AUTH_USER_SESSION_INVALID`,
      message  : `The account session has expired, or been invalidated.`,
      solution : `Re-authenticate your account credentials.`
    }, 401);
  },

  /**
   * Returns an invalid group session error.
   * @return {Object}
   */
  invalidGroupSession() {
    return error.parse({
      code     : `AUTH_GROUP_SESSION_INVALID`,
      message  : `Your session no longer has access to the authenticated group.`,
      solution : `Re-authenticate your account credentials.`
    }, 401);
  },

  /**
   * Returns an invalid grup role error.
   * @return {Object}
   */
  invalidGroupRole() {
    return error.parse({
      code     : `AUTH_GROUP_ROLE_INVALID`,
      message  : `Your group role credentials could not be assigned.`,
      solution : `Re-authenticate your account credentials.`
    }, 401);
  }

};
