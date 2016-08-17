'use strict';

let fs    = require('co-fs');
let path  = require('path');
let error = Bento.Error;
let log   = Bento.Log;

module.exports = function *() {
  let hooks = yield fs.readdir(Bento.HOOKS_PATH);

  log.title('HOOKS');

  for (let i = 0, len = hooks.length; i < len; i++) {
    let hook = path.join(Bento.HOOKS_PATH, hooks[i], 'index.js');
    let stat = null;

    // ### File Stat

    try {
      stat = yield fs.lstat(hook);
    } catch (err) {
      error.optional.entity(err, hook);
    }

    // ### Load Hook

    if (stat && stat.isFile()) {
      try {
        log.silent('info')(`Loading ${ hooks[i] } hooks`);
        require(hook);
      } catch (err) {
        error.optional.require(err, hook);
      }
    }
  }
};
