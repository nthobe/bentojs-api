'use strict';

let path   = require('path');
let config = require('bentojs-config');

// ### Bento
// Expose bento on the global scope.

global.Bento = module.exports = {};

// ### Paths
// Absolute paths to the various core concept folders of the bento api.

Bento.ROOT_PATH      = path.join(__dirname,       '../../');
Bento.NODE_MODULES   = path.join(Bento.ROOT_PATH, 'node_modules');
Bento.CONFIG_PATH    = path.join(Bento.ROOT_PATH, 'config');
Bento.INTERFACE_PATH = path.join(Bento.ROOT_PATH, 'interface');
Bento.MODULE_PATH    = path.join(Bento.ROOT_PATH, 'modules');
Bento.SERVICE_PATH   = path.join(Bento.ROOT_PATH, 'services');
Bento.POLICY_PATH    = path.join(Bento.ROOT_PATH, 'policies');
Bento.PROVIDER_PATH  = path.join(Bento.ROOT_PATH, 'providers');
Bento.HOOKS_PATH     = path.join(Bento.ROOT_PATH, 'hooks');
Bento.STORAGE_PATH   = path.join(Bento.ROOT_PATH, 'storage');
Bento.TEST_PATH      = path.join(Bento.ROOT_PATH, 'test');

// ### NODE_ENV
// Shortcut constant to the current running NODE_ENV

Bento.ENV = process.env.NODE_ENV;

// ### Config
// Exposes the parsed api configuration on the bento object.

Bento.config = config(Bento.CONFIG_PATH);

// ### Testing
// A method that returns a boolean value of true if the current NODE_ENV
// is in a test state.

Bento.isTesting = function isTesting() {
  return Bento.ENV === 'test';
};

// ### Bento Extensions
// List of modules that extends bento with new functionality

require('./lib/settings');
require('./lib/helpers');
require('./lib/event');
require('./lib/error');
require('./lib/log');
require('./lib/redis');
require('./lib/hooks');
require('./lib/auth');
require('./lib/store');
require('./lib/loader');
require('./lib/router');
require('./lib/resource');
require('./lib/interface');
require('./lib/socket');
require('./lib/access');
require('./run/bootstrap');
require('./run/server');
require('./run/app');
