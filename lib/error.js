'use strict';

let moment = require('moment');

Bento.Error = {

  /**
   * List of custom error handlers.
   * @type {Object}
   */
  handlers : {},

  /**
   * Register a route handler for errors occuring during routing requests.
   * @param {Mixed}    path    A single string or an array of strings
   * @param {Function} handler The handler method
   */
  handler(path, handler) {
    if (path.constructor === Array) {
      path.forEach((p) => {
        Bento.Error.handlers[p.replace(/\s+/g, ' ')] = handler;
      });
    } else {
      Bento.Error.handlers[path] = handler;
    }
  },

  /**
   * Parses an object into a unified system error object.
   * @param  {Object} err
   * @param  {Number} status
   * @return {Object}
   */
  parse(err, status) {
    let error = new Error(err.message || err.toString());

    // ### Prepare Error

    error.status = status || 500;
    error.code   = err.code;

    // ### Prepare Optional

    if (err.solution) { error.solution = err.solution; }
    if (err.data)     { error.data     = err.data; }
    if (err.stack)    { error.stack    = err.stack; }

    return error;
  },

  // ### Optional Handler
  // A list of optional error checks, usefull for when some errors can be
  // ignored while throwing errors that are not optional.

  optional : {

    /**
     * Check if the required path is present or not, throw an error if not.
     * This checks file being read with 'require'.
     * @param {Object} err
     * @param {String} path
     */
    require(err, path) {
      if (err.code === 'MODULE_NOT_FOUND' && err.toString().match(path)) {
        return;
      }
      throw err;
    },

    /**
     * Check if the required path is present or not, throw an error if not.
     * This checks file being read without 'require'.
     * @param {Object} err
     * @param {String} path
     */
    entity(err, path) {
      let optional = [ 'ENOTDIR', 'ENOENT' ];
      if (optional.indexOf(err.code) !== -1 && err.toString().match(path)) {
        return;
      }
      throw err;
    }

  }

};
