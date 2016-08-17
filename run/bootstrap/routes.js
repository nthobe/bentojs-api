'use strict';

let helpers = require('./helpers');
let log     = Bento.Log;

module.exports = function *() {
  log.title('ROUTES');
  yield helpers.registerFile(Bento.settings.getModulePaths(), 'routes.js', 'Registering ${ target } module routes');
};
