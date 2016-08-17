'use strict';

let fs      = require('co-fs');
let path    = require('path');
let helpers = require('./helpers');
let error   = Bento.Error;
let log     = Bento.Log;

module.exports = function *() {
  log.title('TESTS');

  // ### Provider Tests

  let providers = Bento.settings.getProviderPaths();
  for (let i = 0, len = providers.length; i < len; i++) {
    let provider = yield helpers.getDirectory(providers[i]);
    if (!provider) {
      continue;
    }
    yield register(provider, 'provider', providers[i]);
  }

  // ### Module Tests

  let modules = Bento.settings.getModulePaths();
  for (let i = 0, len = modules.length; i < len; i++) {
    let mod = yield helpers.getDirectory(modules[i]);
    if (!mod) {
      continue;
    }
    yield register(mod, 'module', modules[i]);
  }
};

/**
 * Register unit tests.
 * @param  {String} dir
 * @param  {String} type
 * @param  {String} target
 */
function *register(dir, type, target) {
  let file = path.join(dir, 'tests/index.js');
  try {
    let stats = yield fs.lstat(file);
    if (stats.isFile()) {
      log.info(`Registering ${ target.split('/').pop() } tests`);
      yield Bento.Register.tests(dir, type, target.split('/').pop(), file);
    }
  } catch (err) {
    error.optional.entity(err, file);
  }
};
