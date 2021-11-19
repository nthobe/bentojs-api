'use strict';

let fs    = require('fs');
let path  = require('path');
let Koa   = require('koa');
let log   = Bento.Log;
const app = new Koa();

Bento._app = function *() {
  yield Bento._bootstrap();
  yield registerMiddleware();
  yield startServer();
};

function *registerMiddleware() {
  log.title('MIDDLEWARE');
  Bento.api('middleware').forEach((target) => {
    let targetPath = path.join(Bento.ROOT_PATH, 'middleware', target + '.js');
    if (fs.existsSync(targetPath)) {
      log.silent('info')(`Loading [${ target }]`);
      require(targetPath)(app);
    }
  });
}

function *startServer() {
  log.title('STARTING SERVERS');
  log.silent('info')(`listening on server port: ${ Bento.config.api.port }`);

  yield require('./bootstrap/modules');

  app.listen(Bento.config.api.port, "127.0.0.1");
}
