'use strict';

let Relay  = require('./relay');
let Socket = require('./socket');
let config = Bento.config.socket;

const { Emitter } = require('@socket.io/redis-emitter');
const { createClient } = require("redis");

const redisClient = createClient({
    host : config.redis.host,
    port : config.redis.port
});
const io = new Emitter(redisClient);

// Gives direct access to the instanced IO as well as a sugar user method
// to communicate directly with authenticated sockets.
Bento.IO = new Socket(io);

// Custom functions provides a easy way to send relay payloads to the front end.
Bento.Relay = new Relay(io);
