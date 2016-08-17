'use strict';

let fs      = require('co-fs');
let cluster = require('cluster');
let path    = require('path');
let helpers = require('./helpers');
let log     = Bento.Log;

module.exports = function *() {
  let providers = Bento.settings.getProviderPaths();
  log.title('PROVIDERS');
  for (let i = 0, len = providers.length; i < len; i++) {
    let provider = yield helpers.getDirectory(providers[i]);
    if (!provider) {
      continue;
    }
    let config = JSON.parse(yield fs.readFile(path.join(provider, 'package.json')));
    log.silent('info')(`Loading ${ config.bento.name }`);
    if (cluster.isMaster) {
      yield helpers.bootstrap(provider);
    }
    if (cluster.isWorker || Bento.isTesting()) {
      if (config.bento && config.bento.init) {
        yield helpers.initiate(provider, config.bento.init);
      }
    }
  }
};
