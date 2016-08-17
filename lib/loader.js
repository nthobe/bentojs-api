'use strict';

let path     = require('path');
let log      = Bento.Log;
let settings = {
  modules   : Bento.settings.get('modules'),
  providers : Bento.settings.get('providers')
};

/**
 * Requires a file with api folder as root
 * @param  {String} target
 * @return {Mixed}
 */
Bento.api = function(target) {
  return require(path.join(Bento.ROOT_PATH, target));
};

/**
 * Requires a bento provider directory from node_modules
 * @param  {String} target
 * @return {Mixed}
 */
Bento.provider = function(target) {
  let split  = target.split('/');
  let config = settings.providers[split.shift()];
  return require(path.join(Bento.ROOT_PATH, config.location, config.folder, split.join('/')));
};

/**
 * Requires a bento module directory from node_modules
 * @param  {String} target
 * @return {Mixed}
 */
Bento.module = function(target) {
  let split  = target.split('/');
  let config = settings.modules[split.shift()];
  return require(path.join(Bento.ROOT_PATH, config.location, config.folder, split.join('/')));
};

/**
 * Requires a registered controller
 * @param  {String} id
 * @return {Object}
 */
Bento.controller = function(id) {
  if (!Bento.store.controllers[id]) {
    log.error(`Requested controller [${ id }] has not been defined`);
    return null;
  }
  return Bento.store.controllers[id];
};

/**
 * Requires a registered model
 * @param  {String} id
 * @return {Object}
 */
Bento.model = function(id) {
  if (!Bento.store.models[id]) {
    log.error(`Requested model [${ id }] has not been defined`);
    return null;
  }
  return Bento.store.models[id];
};

/**
 * Returns a bento policy handler
 * @param  {String}   policy
 * @return {Function}
 */
Bento.policy = function(policy) {
  if (!Bento.store.policies[policy]) {
    log.error(`Requested policy [${ policy }] has not been defined`);
    return null;
  }
  return Bento.store.policies[policy];
};
