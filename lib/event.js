'use strict';

let co      = require('co');
let moment  = require('moment');
let helpers = Bento.Helpers.Errors;
let log     = Bento.Log;
let events  = {};

Bento.Event = {

  /**
   * Emits a new api event.
   * @param  {String} type
   * @param  {Mixed}  ...args
   */
  emit(type) {
    let emitArgs = arguments;
    let handlers = events[type];
    let self     = this;

    if (!handlers || !handlers.length) {
      return false;
    }

    handlers.forEach((handler) => {
      co(function *() {
        try {
          switch (emitArgs.length) {
            case 1:
              yield handler.call(self);
              break;
            case 2:
              yield handler.call(self, emitArgs[1]);
              break;
            case 3:
              yield handler.call(self, emitArgs[1], emitArgs[2]);
              break;
            default:
              let len  = emitArgs.length;
              let args = new Array(len - 1);
              for (let i = 1; i < len; i++) {
                args[i - 1] = emitArgs[i];
              }
              yield handler.apply(self, args);
          }
        } catch (err) {
          handleError(err);
        }
      });
    });
  },

  /**
   * Registers a new event listener.
   * @param {String}   id
   * @param {Function} handler
   */
  on(id, handler) {
    if (!events[id]) {
      events[id] = [];
    }
    events[id].push(handler);
  }

};

/**
 * Logs a new error event to the console and database.
 * @param {Object} error
 */
function handleError(error) {
  log.error({
    event   : error.event,
    code    : error.code,
    message : error.message,
    data    : error.data,
    stack   : error.stack
  });
}
