'use strict';

let bcrypt = Bento.provider('bcrypt');
let type   = Bento.Helpers.Type;
let error  = Bento.Error;
let log    = Bento.Log;
let config = Bento.config;

Bento.Interface = {

  /**
   * List of system roles.
   * @type {Array}
   */
  roles : null,

  // ### Boot Methods

  /**
   * Loads the interface and verify that it is correctly set up.
   * @return {Boolean}
   */
  *_load() {
    log.silent('info')('Verifying Interface');
    yield this._verify();
    yield this._defaults();
    yield this._roles();
  },

  /**
   * Verifies that the required interface models has been properly registered.
   * @return {Void}
   */
  *_verify() {
    [
      'User',
      'Role',
      'Group',
      'GroupUser',
      'GroupRole'
    ].forEach((val) => {
      let model = Bento.model(val);
      if (!model) {
        throw error.parse({
          code     : 'INTERFACE_MODEL_MISSING',
          message  : `Could not retrieve ${ val } from the bento store.`,
          solution : `Confirm that the ${ val } model is being registered correctly in the ./interface directory.`
        });
      }
      log.silent('info')(` - ${ val } Verified`);
    });
  },

  /**
   * Bootstraps default configuration.
   * @return {Void}
   */
  *_defaults() {
    log.silent('info')('Creating Defaults');
    yield createGroups(config.groups || []);
    yield createUsers(config.users || []);
  },

  /**
   * Updates the roles list, should be done when role values changes
   * in the database.
   */
  *_roles() {
    this.roles = yield Bento.model('Role').find({
      order : [
        [ 'position', 'ASC' ]
      ]
    });
    log.silent('info')(` - Roles loaded`);
  }

};

/**
 * Creates database records for each group provided.
 * @param  {Array} groups
 * @return {Void}
 */
function *createGroups(groups) {
  let Group = Bento.model('Group');
  let count = yield Group.count();
  if (count > 1) {
    return;
  }
  for (let i = 0, len = groups.length; i < len; i++) {
    let group = new Group(groups[i].data);
    yield group.save();
    yield createRoles(group, groups[i].roles);
  }
}

/**
 * Creates a list of roles for the provided group.
 * @param  {Number} group
 * @param  {Array}  roles
 * @return {Void}
 */
function *createRoles(group, roles) {
  let GroupRole = Bento.model('GroupRole');
  let systemIds = [ 1, 2, 3, 4 ];
  let missing   = [];

  // ### Verify Required Roles

  systemIds.forEach(id => {
    let isMissing = true;
    roles.forEach(role => {
      if (id === role.roleId) {
        isMissing = false;
      }
    });
    if (isMissing) {
      missing.push(id);
    }
  });

  if (missing.length) {
    throw error.parse({
      code    : 'USER_BOOTSTRAP',
      message : `Missing required role assignments | [group:${ group.name }][roles:${ missing.join(',') }]`
    });
  }

  // ### Verify Roles

  for (let i = 0, len = roles.length; i < len; i++) {
    let groupRole = new GroupRole({
      groupId : group.id,
      roleId  : roles[i].roleId,
      name    : roles[i].name
    });
    yield groupRole.save();
  }
}

/**
 * Creates database records for each user provided.
 * @param  {Array} users
 * @return {Void}
 */
function *createUsers(users) {
  let User      = Bento.model('User');
  let Group     = Bento.model('Group');
  let GroupRole = Bento.model('GroupRole');
  let GroupUser = Bento.model('GroupUser');
  let count     = yield User.count();
  if (count) {
    return;
  }
  for (let i = 0, len = users.length; i < len; i++) {
    let data = users[i];

    // ### Create User

    let user = new User(data);
    user.password = yield bcrypt.hash(user.password, 10);
    yield user.save();

    // ### Group & Role

    let group, groupId, groupRoleId;

    if (data.group) {
      group = yield Group.findOne({
        where : {
          name : data.group
        }
      });
      if (!group) {
        throw error.parse({
          code    : 'USER_BOOTSTRAP',
          message : `Failed to assign group, '${ data.group }' does not exist`
        });
      } else {
        groupId = group.id;
      }
    } else {
      groupId = 1;
    }

    if (data.role) {
      let groupRole = yield GroupRole.findOne({
        where : {
          groupId : groupId,
          name    : data.role
        }
      });
      if (!groupRole) {
        throw error.parse({
          code    : 'USER_BOOTSTRAP',
          message : `Failed to assign group role, '${ data.role }' does not exist`
        });
      } else {
        groupRoleId = groupRole.id;
      }
    } else if (groupId === 1) {
      groupRoleId = 1;
    } else {
      throw error.parse({
        code     : 'USER_BOOTSTRAP',
        message  : `No role provided for user '${ user.name() }' in group '${ group.name }'`,
        solution : 'Only public group members can be assigned without a role, make sure to define a role for non public groups.'
      });
    }

    // ### Group User

    let groupUser = new GroupUser({
      userId      : user.id,
      groupId     : groupId,
      groupRoleId : groupRoleId
    });
    yield groupUser.save();
  }
}
