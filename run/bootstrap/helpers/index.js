'use strict';

let fs    = require('co-fs');
let path  = require('path');
let type  = Bento.Helpers.Type;
let error = Bento.Error;
let log   = Bento.Log;
let reqStack = require('require-stack');

module.exports = {

  // ### Execution Helpers

  /**
   * Bootstraps provider, module or service.
   * @param {String} target
   */
  *bootstrap(target) {
    let bfile = path.join(target, 'bootstrap.js');
    let bdir  = path.join(target, 'bootstrap', 'index.js');
    let boot  = null;

    // ### File
    // Check for a bootstrap.js file.

    try {
      boot = require(bfile);
      if (type.isFunction(boot)) {
        yield boot();
      }
    } catch (err) {
      error.optional.require(err, bfile);
    }

    // ### Folder
    // Check for bootstrap/index.js file.

    try {
      boot = require(bdir);
      if (type.isFunction(boot)) {
        yield boot();
      }
    } catch (err) {
      error.optional.require(err, bdir);
    }
  },

  /**
   * Executes a provide, module, or service init file.
   * @param {String} target
   * @param {String} file
   */
  *initiate(target, file) {
    let init = require(path.join(target, file));
    if (type.isFunction(init)) {
      yield init();
    }
  },

  /**
   * Loops through the provided targets and requires the provided file target. It
   * also support a optional logText to silently output.
   * @param {Array}  targets List of folders to require the 'file'
   * @param {String} file    The file to require
   * @param {String} logText The log text to display to console.
   */
  *registerFile(targets, file, logText) {
    for (let i = 0, len = targets.length; i < len; i++) {
      let target = yield this.getDirectory(targets[i]);
      if (!target) {
        continue;
      }
      try {
        reqStack(path.join(target, file));
        log.silent('info')(logText.replace('${ target }', target.split('/').pop()));
      } catch (err) {
        error.optional.require(err, file);
      }
    }
  },

  /**
   * Requires all the files under the provided folder.
   * @param {Array}  targets List of directories to require files under
   * @param {String} ext     Optional extension restriction
   */
  *registerFiles(targets, ext) {
    for (let i = 0, len = targets.length; i < len; i++) {
      let target = yield this.getDirectory(targets[i]);
      if (!target) {
        continue;
      }
      let items = yield fs.readdir(target);
      items.forEach(item => {
        if (ext && path.extname(item) !== ext) {
          return;
        }
        try {
          console.log(target, item, path.join(target, item));
          reqStack(path.join(target, item));
        } catch (err) {
          error.optional.require(err, path.join(target, item));
        }
      });
    }
  },

  /**
   * Returns the provided string as a valid directory path or null.
   * @param  {String} pth
   * @return {String}
   */
  *getDirectory(pth) {
    try {
      let stat = yield fs.lstat(pth);
      if (stat.isDirectory()) {
        return pth;
      }
    } catch (err) {
      error.optional.entity(err, pth);
    }
    return null;
  }

};
