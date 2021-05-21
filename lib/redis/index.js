'use strict';

let wrapper = require('co-redis');
let config  = Bento.config;

// ### Redis
// Loads in redis, if redis has been defined in config we load a
// server with the declared configuration.

let redis = (function() {
  if (config.redis) {
    return require('redis').createClient(config.redis);
  }
  return require('redis').createClient();
})();

// ### Bento Redis
// Expose the redis co wrapper on the Bento namespace.

let Redis = Bento.Redis = wrapper(redis);

// ### Redis Bucket
// Adds the redis bento bucket features.

Redis.bucket = require('./bucket').bind(null, Redis);
Redis.lock = require('./lock').bind(null, Redis);
