'use strict';

let Auth       = require('./auth');
let redis      = require('./redis');
let errors     = require('./errors');
let co         = require('co');
let error      = Bento.Error;
let hooks      = Bento.Hooks;
let changeCase = Bento.Helpers.Case;
let config     = Bento.config;

let User      = null;
let Role      = null;
let Group     = null;
let GroupUser = null;
let GroupRole = null;

// ### Bento Auth

Bento.Auth = async(ctx, next) => {
  let token = ctx.request.headers.authorization;
  let user  = null;
  if (token) {
    loadModels();
    user = await co(function*() {
      return yield Bento.Auth.getUser(token);
    });
  }
  ctx.auth = new Auth(user, token);
  await next();
};

/**
 * Exposes the redis generateToken method
 * @type {Function}
 */
Bento.Auth.token = redis.getToken;

/**
 * Returns a users based on the token provided from the redis store.
 * @param  {String} token
 * @return {User}
 */
Bento.Auth.getUser = function *(token) {
  let session = yield redis.getStore(token);

  // ### User

  let user = yield User.findById(session.user);
  if (!user) {
    throw errors.invalidUserSession();
  }

  // ### Connect
  // The central connector to a group, its users and consequently the role
  // of the user within a group.

  let allRecords = yield GroupUser.find({
    where : {
      //groupId : session.group,
      userId  : session.user
    },
    order: [[ 'group_id', 'asc' ]],
    include: [
      {
        model: 'Group',
        as: 'group'
      },
      {
        model: 'GroupRole',
        as: 'group_role'
      }
    ]
  });

  let connector = allRecords[0];

  // ### Group && Group Role
  // Fetches the group, and group role. If either of these are missing we throw
  // a invalidated group session error.

  user.group = connector.group;
  user.groupRole = connector.groupRole; // new functionality needs this in context

  if (!user.group || !user.groupRole) {
    throw errors.invalidGroupSession();
  }

  // ### Role
  // Fetches the system access role assigned via the groupRole the user is
  // connected to.

  let role = yield Role.findById(user.groupRole.roleId);
  if (!role) {
    throw errors.invalidGroupRole();
  }

  // ### Assignments
  // Assigns the group object to the user for group related verifications along
  // with the users role title and system role name.

  user.tagList = allRecords;
  user.role  = {
    title : user.groupRole.name,
    name  : role.name
  };

  return user;
};

/**
 * Returns the provider config.
 * @return {Object}
 */
Bento.Auth.getConfig = function *() {
  if (!config.auth) {
    throw errors.missingConfiguration();
  }
  return config.auth;
};

function loadModels() {
  if (!User)      { User      = Bento.model('User'); }
  if (!Role)      { Role      = Bento.model('Role'); }
  if (!Group)     { Group     = Bento.model('Group'); }
  if (!GroupUser) { GroupUser = Bento.model('GroupUser'); }
  if (!GroupRole) { GroupRole = Bento.model('GroupRole'); }
}
