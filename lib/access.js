'use strict';

let error = Bento.Error;

Bento.Access = {

  /**
   * Returns a boolean value if the provided user has access to perform an action.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @param  {String} [role] The role to verify. Default: admin
   */
  verify(user, _user, role) {
    if (user.id !== _user.id && !_user.hasAccess(role || 'admin')) {
      throw this._error(role || 'admin', _user.role.name);
    }
  },

  /**
   * Verifies that the user provided has moderator privileges.
   * @param  {Object}  user
   */
  verifyModerator(user) {
    if (!user.hasAccess('moderator')) {
      throw this._error('moderator', user.role.name);
    }
  },

  /**
   * Verifies that the user provided has admin privileges.
   * @param  {Object}  user
   */
  verifyAdmin(user) {
    if (!user.hasAccess('admin')) {
      throw this._error('admin', user.role.name);
    }
  },

  /**
   * Verifies that the user provided has owner privileges.
   * @param  {Object}  user
   */
  verifyOwner(user) {
    if (!user.hasAccess('owner')) {
      throw this._error('owner', user.role.name);
    }
  },

  /**
   * Verifies that the user provided has super privileges.
   * @param  {Object}  user
   */
  verifySuper(user) {
    if (!user.hasAccess('super')) {
      throw this._error('super', user.role.name);
    }
  },

  /**
   * Returns a parsed credential error.
   * @param  {String} required
   * @param  {String} provided
   * @return {Object}
   */
  _error(required, provided) {
    return error.parse({
      code    : 'INVALID_CREDENTIALS',
      message : 'You are not authorized to perform this operation',
      data    : {
        role : {
          required : required,
          provided : provided
        }
      }
    }, 400);
  }

};
