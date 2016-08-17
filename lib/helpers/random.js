'use strict';

let assert = require('assert');
let base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';
let base10 = '0123456789';

// ### Random

let Random = module.exports = create(base62);

// ### Base Randoms

Random.base62 = Random;
Random.base36 = create(base36);
Random.base10 = create(base10);

// ### GUID

Random.guid = function guid() {
  let S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `${ S4() }${ S4() }-${ S4() }-${ S4() }-${ S4() }-${ S4() }${ S4() }${ S4() }`;
};

/**
 * @private
 * @method create
 * @param  {String} chars
 */
function create(chars) {
  assert(typeof chars === 'string');
  let length = Buffer.byteLength(chars);
  return function rndm(len) {
    assert(typeof len === 'number' && len >= 0);
    let salt = '';
    for (let i = 0; i < len; i++) {
      salt += chars[Math.floor(length * Math.random())];
    }
    return salt;
  };
}
