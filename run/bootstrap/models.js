'use strict';

let helpers = require('./helpers');
let log     = Bento.Log;

module.exports = function *() {
  log.title('MODELS');
  yield helpers.registerFiles([ Bento.INTERFACE_PATH ], '.js');
  yield helpers.registerFiles(Bento.settings.getModulePaths('models'), '.js');
};
