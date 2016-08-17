'use strict';

let helpers = require('./helpers');
let log     = Bento.Log;

module.exports = function *() {
  log.title('CONTROLLERS');
  yield helpers.registerFiles(Bento.settings.getModulePaths('controllers'), '.js');
};
