'use strict';

let co      = require('co');
let cluster = require('cluster');
let print   = Bento.Helpers.Print;
let log     = Bento.Log;
let error   = Bento.Error;
let config  = Bento.config;

Bento.runServer = function() {
  co(function *() {
    try {
      if (cluster.isMaster) {
        yield master();
      } else {
        yield worker();
      }
    } catch (err) {
      log.error({
        code     : err.code,
        message  : err.toString().replace('Error: ', ''),
        solution : err.solution,
        stack    : err.stack
      });
      console.log('\n  You must resolve startup errors, aborting...\n');
      process.exit(1);
    }
  });
};

/**
 * Bootstrap the master instance of the cluster.
 * @yield {Void}
 */
function *master() {

  // ### Master Bootstrap
  // Starts the master bootstrap process, this pre boots the application
  // before forking workers.

  print.title(Bento.config.api.name.toUpperCase() + ' @ ' + Bento.config.api.version, '=');

  yield Bento._bootstrap();

  // ### Start Workers
  // Start workers based on available cpus

  let cpus = require('os').cpus().length;
  if (config.cluster && config.cluster.cpus < cpus) {
    cpus = config.cluster.cpus;
  }

  log.title ('API SETTINGS', true);
  log.info  (`Port     : ${ config.api.port }`);
  log.info  (`Clusters : ${ cpus }`);

  console.log('\n  STARTING WORKERS\n');

  // ### Bootstrap Modules

  yield require('./bootstrap/modules');

  // ### Fork Applications

  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, signal) {
    log.error(`Worker ${ worker } was killed by signal: ${ signal }`);
  });
}

/**
 * Boots the application on a worker instance.
 * @yield {Void}
 */
function *worker() {
  yield Bento._app();
}
