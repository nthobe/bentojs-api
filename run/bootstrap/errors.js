'use strict';

let helpers = require('./helpers');
let log     = Bento.Log;

module.exports = function *() {
  log.title('ERROR HANDLERS');
  yield helpers.registerFile(Bento.settings.getModulePaths(), 'errors.js', 'Registering ${ target } module errors');
};
