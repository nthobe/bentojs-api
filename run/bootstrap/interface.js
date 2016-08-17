'use strict';

let intrface = Bento.Interface;
let log      = Bento.Log;

module.exports = function *() {
  log.title('INTERFACE');
  yield intrface._load();
};
