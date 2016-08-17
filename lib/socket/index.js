'use strict';

let Relay  = require('./relay');
let Socket = require('./socket');
let config = Bento.config.socket;

// ### IO
// Instatiate the IO emitter that lets instances communicate with
// the socket.io server instance.

let io = require('socket.io-emitter')({
  host : config.redis.host,
  port : config.redis.port
});

// ### IO
// Gives direct access to the instanced IO as well as a sugar user method
// to communicate directly with authenticated sockets.

Bento.IO = new Socket(io);

// ### Relay
// Custom functions provides a easy way to send relay payloads to the front end.

Bento.Relay = new Relay(io);