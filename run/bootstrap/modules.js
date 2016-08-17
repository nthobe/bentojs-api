'use strict';

let fs      = require('co-fs');
let cluster = require('cluster');
let path    = require('path');
let helpers = require('./helpers');
let log     = Bento.Log;

module.exports = function *() {
  let modules = Bento.settings.getModulePaths();
  for (let i = 0, len = modules.length; i < len; i++) {
    let target = yield helpers.getDirectory(modules[i]);
    if (!target) {
      continue;
    }
    let config = JSON.parse(yield fs.readFile(path.join(target, 'package.json')));
    if (cluster.isMaster) {
      yield helpers.bootstrap(target);
    }
    if (cluster.isWorker || Bento.isTesting()) {
      if (config.bento && config.bento.init) {
        yield helpers.initiate(target, config.bento.init);
      }
    }
  }
};
