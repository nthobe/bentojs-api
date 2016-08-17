'use strict';

let co      = require('co');
let fs      = require('co-fs');
let coMocha = require('co-mocha');
let Mocha   = require('mocha');
let path    = require('path');
let print   = Bento.Helpers.Print;
let log     = Bento.Log;
let error   = Bento.Error;

coMocha(Mocha);

/**
 * Performs a range of tests defined in the api config.
 * @method runTests
 */
Bento.runTests = function() {
  co(testRunner);
};

/**
 * @method testRunner
 */
function *testRunner() {
  try {
    print.title('TESTING ' + Bento.config.api.name.toUpperCase() + ' @ ' + Bento.config.api.version, '=');

    yield Bento._app();

    let mocha    = new Mocha();
    let settings = Bento.settings.get('tests');
    let tests    = Bento.store.tests;
    for (let key in tests) {
      if (settings.ignore.indexOf(key) === -1) {
        mocha.addFile(tests[key]);
      }
    }
    mocha.run(process.exit);
  } catch (err) {
    log.error({
      code    : err.code,
      message : err.toString().replace('Error: ', ''),
      stack   : err.stack
    });
    console.log('\n  You must resolve startup errors, aborting...\n');
    process.exit(1);
  }
}
