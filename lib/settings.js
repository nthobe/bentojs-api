'use strict';

let fs   = require('fs');
let path = require('path');

Bento.settings = {

  /**
   * The json configuration stored under .bento in api root directory.
   * @type {Object}
   */
  _store : JSON.parse(fs.readFileSync(path.join(Bento.ROOT_PATH, '.bento'))),

  /**
   * Returns a settings configuration under provided key.
   * @param  {String} key
   * @return {Mixed}
   */
  get(key) {
    return this._store[key];
  },

  /**
   * Returns all the registered provider paths, a optional target parameter will
   * append itself to the path if provided.
   * @param  {String} [target]
   * @return {Array}
   */
  getProviderPaths(target) {
    let result    = [];
    let providers = this.get('providers');
    for (let key in providers) {
      result.push(path.join(Bento.ROOT_PATH, providers[key].location, providers[key].folder, target || ''));
    }
    return result;
  },

  /**
   * Returns all the registered provider paths, a optional target parameter will
   * append itself to the path if provided.
   * @param  {String} [target]
   * @return {Array}
   */
  getModulePaths(target) {
    let result  = [];
    let modules = this.get('modules');
    for (let key in modules) {
      result.push(path.join(Bento.ROOT_PATH, modules[key].location, modules[key].folder, target || ''));
    }
    return result;
  }

};
