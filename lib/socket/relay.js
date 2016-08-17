'use strict';

let log = Bento.Log;

module.exports = class Relay {

  /**
   * @constructor
   */
  constructor(io) {
    this.io = io;
  }

  /**
   * @method admin
   * @param {String} resource
   * @param {Object} payload
   */
  admin(resource, payload) {
    if (isPayloadValid(payload)) {
      log.debug(`Relay > Admin ${ getRelayReport(resource, payload) }`);
      this.io.to('admin').emit('relay', resource, payload);
    }
  }

  /**
   * @method user
   * @param {Mixed}  id
   * @param {String} resource
   * @param {Object} payload
   */
  user(id, resource, payload) {
    if (isPayloadValid(payload)) {
      log.debug(`Relay > User ${ id } ${ getRelayReport(resource, payload) }`);
      this.io.to('user:' + id).emit('relay', resource, payload);
    }
  }

  /**
   * @method emit
   * @param {String} resource
   * @param {Object} payload
   */
  emit(resource, payload) {
    if (isPayloadValid(payload)) {
      log.debug(`Relay > Emit ${ getRelayReport(resource, payload) }`);
      this.io.emit('relay', resource, payload);
    }
  }

};

/**
 * Returns a relay report string for any emits occuring in the system.
 * @param  {String} resource
 * @param  {Object} payload
 * @return {String}
 */
function getRelayReport(resource, payload) {
  return `[${ resource }:${ payload.type }]${ [ 'store', 'update', 'delete' ].indexOf(payload.type) !== -1 ? `[id:${ payload.data.id }]` : '' }`;
}

/**
 * Validate the relay payload.
 * @private
 * @method isPayloadValid
 * @param  {Object} payload
 * @return {Boolean}
 */
function isPayloadValid(payload) {
  if (Bento.isTesting() || !payload.type) {
    return false;
  }
  return true;
}
