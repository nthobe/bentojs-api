'use strict';

module.exports = class SocketIO {

  constructor(io) {
    this.io = io;
    return io;
  }

  /**
   * Emits event to registered bento:user:id room that is created when
   * a user is authenticated with the server.
   * @method user
   * @param  {String} id
   */
  user(id) {
    return this.io.to('user:' + id);
  }

};
