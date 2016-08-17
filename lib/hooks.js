'use strict';

let error = Bento.Error;
let log   = Bento.Log;
let store = {};

Bento.Hooks = {

  /**
   * Stores a hook and its handler.
   * @param {String} id
   * @param {Mixed}  handler
   */
  set(id, handler) {
    if (store[id]) {
      log.warn(`The provided hook '${ id }' has already been defined, double check your hook ids.`);
    }
    store[id] = handler;
  },

  /**
   * Returns a boolean value if the hook exists or not.
   * @param  {String}  id
   * @return {Boolean}
   */
  has(id) {
    return store[id] ? true : false;
  },

  /**
   * Returns a hook if it has been defined.
   * @param  {String}  id
   * @param  {Boolean} required
   * @return {Mixed}
   */
  get(id, required) {
    if (this.has(id)) {
      return store[id];
    }

    // ### Required Check
    // When a hook is required we throw an error if it has not been defined.

    if (required) {
      throw error.parse({
        code    : `HOOK_NOT_FOUND`,
        message : `The provided hook request for '${ id }' is required but has not been defined.`
      });
    }
  },

  /**
   * Calls a hook with provided id.
   * @param {String} id
   * @param {...args}
   */
  *call() {
    let spread = this.prepareArguments(arguments);
    let hook   = this.get(spread.id);
    if (hook) {
      return yield hook.apply(hook, spread.args);
    }
  },

  /**
   * Calls a hook, throw error if hook does not exist.
   * @param {String} id
   * @param {...args}
   */
  *require() {
    let spread = this.prepareArguments(arguments);
    let hook   = this.get(spread.id, true);
    if (hook) {
      return yield hook.apply(hook, spread.args);
    }
  },

  /**
   * Prepares arguments.
   * @param  {Arguments} args
   * @return {Object}
   */
  prepareArguments(args) {
    let result = {
      id   : null,
      args : []
    };
    for (let i = 0, len = args.length; i < len; i++) {
      if (i === 0) {
        result.id = args[i];
        continue;
      }
      result.args.push(args[i]);
    }
    return result;
  }

};
