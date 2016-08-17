'use strict';

let fs    = require('co-fs');
let path  = require('path');
let log   = Bento.Log;
let error = Bento.Error;

/**
 * Storage for all registered entities.
 * @type {Object}
 */
Bento.store = {
  models      : {},
  controllers : {},
  policies    : {},
  tests       : {}
};

// ### Bento Register
// List of available bento registration methods.

Bento.Register = {

  /**
   * Registers a model with the API.
   * @param  {String}   name
   * @param  {String}   provider
   * @param  {Function} getModel
   */
  Model(name, provider, getModel) {
    log.silent('info')(`Registering ${ name } model`);
    if (Bento.store.models[name]) {
      throw error.parse({
        code    : `BENTO_MODEL_CONFLICT`,
        message : `${ name } has already been loaded into the api.`
      });
    }
    Bento.store.models[name] = Bento.provider(provider + '/model')(name, getModel);
  },

  /**
   * Register a controller with the API.
   * @param {String} name
   * @param {Object} controller
   */
  Controller(name, controller) {
    log.silent('info')(`Registering ${ name } controller`);
    if (Bento.store.controllers[controller]) {
      throw error.parse({
        code    : `BENTO_CONTROLLER_CONFLICT`,
        message : `${ controller } has already been loaded into the api.`
      });
    }
    Bento.store.controllers[name] = controller({});
  },

  /**
   * Registered a resource controller.
   * @param  {String} resource
   * @param  {String} name
   * @param  {Object} controller
   */
  ResourceController(resource, name, controller) {
    log.silent('info')(`Registering ${ name } resource controller`);
    if (Bento.store.controllers[controller]) {
      throw error.parse({
        code    : `BENTO_CONTROLLER_CONFLICT`,
        message : `${ controller } has already been loaded into the api.`
      });
    }
    Bento.store.controllers[name] = controller(Bento.Resource(resource));
  },

  /**
   * Register a policy with the API
   * @param {String}   policy  The id of the policy
   * @param {Function} handler The policy handler function
   */
  policy(policy, handler) {
    if (Bento.store.policies[policy]) {
      throw error.parse({
        code    : `BENTO_POLICY_CONFLICT`,
        message : `${ policy } has already been loaded into the api.`
      });
    }
    Bento.store.policies[policy] = handler;
  },

  /**
   * Register a list of unit tests with the API
   * @param {String} source  The path to your module root [__dirname]
   * @param {String} type    Type of test can be [service] or [module]
   * @param {String} target  The name of the target module or service you wish to store tests for
   * @param {String} index   Path to the tests/index.js file
   */
  *tests(source, type, target, index) {
    if (Bento.store.tests[target]) {
      throw error.parse({
        code    : `BENTO_TEST_CONFLICT`,
        message : `${ target } has already been loaded into the api.`
      });
    }
    Bento.store.tests[type + ':' + target] = index;
  }

};
