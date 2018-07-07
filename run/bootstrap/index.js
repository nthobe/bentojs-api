'use strict';

let cluster = require('cluster');
let log     = Bento.Log;

Bento._bootstrap = function *() {

  // ### Share Loader
  // Load API components shared on both master, and worker processes.

  let list = ['./models','./providers','./interface','./hooks'];
  for(var ix = 0; ix < list.length; ix++) {
    yield require(list[ix]);
  }

  // ### Worker Loader
  // Load API components for worker processes only.

  if (cluster.isWorker || Bento.isTesting()) {
    yield require('./policies');
    yield require('./controllers');
    yield require('./errors');
    yield require('./routes');
  }
};
