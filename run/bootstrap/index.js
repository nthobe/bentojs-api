'use strict';

let cluster = require('cluster');
let log     = Bento.Log;

/**
 * @method _bootstrap
 */
Bento._bootstrap = function *() {

  // ### Share Loader
  // Load API components shared on both master, and worker processes.

  yield require('./models');
  yield require('./providers');
  yield require('./interface');
  yield require('./hooks');

  // ### Worker Loader
  // Load API components for worker processes only.

  if (cluster.isWorker || Bento.isTesting()) {
    yield require('./policies');
    yield require('./controllers');
    yield require('./errors');
    yield require('./routes');
  }

  // ### Test Loader
  // Load all registered tests under the modules, and providers.

  if (Bento.isTesting()) {
    yield require('./tests');
  }

};
