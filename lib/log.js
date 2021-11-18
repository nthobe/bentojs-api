'use strict';

let cluster    = require('cluster');
let debug      = require('debug');
let prettify   = require('prettyjson');
let type       = Bento.Helpers.Type;
let changeCase = Bento.Helpers.Case;
let event      = Bento.Event;
let config     = Bento.config;


let types = {
  debug : debug('api:debug'),
  info  : debug('api:info'),
  event : debug('api:event'),
  warn  : debug('api:warn'),
  error : debug('api:error')
};


Bento.Log = {

  title(value, isForced) {
    if (cluster.isMaster || Bento.isTesting() || isForced) {
      console.log('\n  %s\n', value);
    }
  },

  silent(level) {
    let testing = Bento.isTesting();
    let levels  = {
      debug : cluster.isWorker && !testing ? () => {} : this.debug,
      info  : cluster.isWorker && !testing ? () => {} : this.info,
      event : cluster.isWorker && !testing ? () => {} : this.event,
      warn  : cluster.isWorker && !testing ? () => {} : this.warn,
      error : cluster.isWorker && !testing ? () => {} : this.error
    };
    return levels[level];
  },

  debug(...value) {
    types.debug(`${ logTime() } ${ value }`);
  },

  info(...value) {
    types.info(`${ logTime() } ${ value }`);
  },

  warn(...value) {
    types.warn(`${ logTime() } ${ value[0] } : ${ value[value.length - 1].stack || new Error().stack }`);
  },

  event(payload) {
    if (type.isString(payload)) {
      return types.event(payload);
    }

    // ### Event Payload
    // Object based events are reported automaticaly and an event is emitted
    // via bentos event system.

    types.event(`${ logTime() }${ payload.type }`);

    event.emit('log:event', payload);

    console.log(payload);
  },

  error(payload) {
    if (type.isString(payload)) {
      return types.error(`${ logTime() }${ payload }`);
    }

    // ### Error Payload
    // Object based errors are reported automaticaly and error event log is
    // emitted via bentos event system.

    types.error(`${ logTime() }INTERNAL_ERROR`);

    // ### Send Error
    // Emits the error on the core event module that can be caught and processed
    // by individual logger modules/providers.

    event.emit('log:error', payload);


    console.log(prettify.render({
      code     : payload.code || 'UNKNOWN_CODE',
      message  : payload.message,
      solution : payload.solution,
      data     : payload.data,
      stack    : payload.stack
    }, {} , 4));
  }
 

};

function logTime() {
   return config.api.log.timeFormat ? (new Date()).toISOString();
}
