'use strict';

let fs   = require('co-fs');
let path = require('path');
let log  = Bento.Log;
let reg  = Bento.Register;

module.exports = function *() {
  let policies = yield fs.readdir(Bento.POLICY_PATH);

  log.title('LOADING POLICIES');

  for (let i = 0, len = policies.length; i < len; i++) {
    let file = path.join(Bento.POLICY_PATH, policies[i]);
    if (path.extname(file) === '.js') {
      let policy = require(file);
      log.silent('info')(`Registering policy: ${ policy.name }`);
      reg.policy(policy.name, policy);
    }
  }
};
