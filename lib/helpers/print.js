'use strict';

/**
 * @class Print
 */
let Print = module.exports = {};

/**
 * @method title
 * @param  {String} value
 * @param  {String} seperator
 */
Print.title = (value, seperator) => {
  console.log('\n  ' + value);
  if (seperator) {
    console.log('  ' + new Array(value.length + 1).join(seperator));
  }
  console.log();
};