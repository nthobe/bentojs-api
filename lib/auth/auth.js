'use strict';

let redis = require('./redis');
let error = Bento.Error;

module.exports = class Auth {

  /**
   * @constructor
   * @param {Object} user
   * @param {String} token
   */
  constructor(user, token) {
    this.auth  = Bento.Auth;
    this.user  = user;
    this.token = token;
  }

  /**
   * Returns a bool value about the presence of an authenticated user.
   * @method check
   * @return {Boolean}
   */
  check() {
    return this.user ? true : false;
  };

  /**
   * Runs a user check on the current instance and throws a verification
   * error there is no active user.
   */
  verify() {
    if (!this.check()) {
      throw error.parse({
        code     : `VERIFICATION_FAILED`,
        message  : `Could not verify a valid user session during the request`,
        solution : `The following request expects a valid connection, make sure you are signed in before attempting to execute on this endpoint.`
      }, 400);
    }
  }

  /**
   * Set persist state on the user token.
   * @method remember
   */
  *remember() {
    yield redis.remember(this.token);
  };

  /**
   * Removes the user from the redis store.
   * @method logout
   * @param  {String} [from]
   */
  *logout(from) {
    if (this.check()) {
      yield redis.logout(this.user.id, from);
    }
  };

};
