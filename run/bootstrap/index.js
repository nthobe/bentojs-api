'use strict';

let cluster = require('cluster');
let log     = Bento.Log;

Bento._bootstrap = function *() {

  // ### Share Loader
  // Load API components shared on both master, and worker processes.

  ['./models','./providers','./interface','./hooks']
    .forEach((row) => (yield require(row))(); );

  // ### Worker Loader
  // Load API components for worker processes only.

  if (cluster.isWorker || Bento.isTesting()) {
    yield require('./policies');
    yield require('./controllers');
    yield require('./errors');
    yield require('./routes');
  }
};
