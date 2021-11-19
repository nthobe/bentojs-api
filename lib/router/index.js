'use strict';

let koaRouterRequire = require('@koa/router');
let handle = require('./route-handler');
let log    = Bento.Log;

let koaRouter = new koaRouterRequire();

/**
 * Runs middleware like operations on the provided route options before executing
 * the request controller.method
 * @class Route
 * @static
 */
let Route = global.Route = () => {
  return koaRouter.routes();
};

function process(verb, route, options) {
  return koaRouter[verb](route, (ctx, next) => {
    function *wrap() {
      log.debug(`${ ctx.method } ${ ctx.path } | ${ ctx.auth.check() ? `${ ctx.auth.user.name() } <${ ctx.auth.user.email }> [ ${ ctx.auth.user.role.title } ]` : 'Guest' }`);

      options = handle.options(options);

      // Add the route to the ctx.route of the request context.
      ctx.route = route;

      // Prepares the incoming parameters and data payload before passing it onto the route handler.
      ctx.params  = yield handle.params(ctx.params);
      ctx.payload = yield handle.payload(ctx);

      // Make sure policies and required parameters has been verified.
      yield handle.checkPolicies(ctx, options.policy);
      yield handle.checkParameters(ctx, options.params);

      yield handle.route(ctx, options);
    }

    let instance = wrap();
    while(true) {
      let value = instance.next();
      if(value.done) {
        return next();
      }
    }
  });
};

Route.koa = koaRouter;
Route.routes = koaRouter.routes;
Route.resource = require('./resource');

Route.post   = (endpoint, options) => process('post', endpoint, options);
Route.get    = (endpoint, options) => process('get', endpoint, options);
Route.put    = (endpoint, options) => process('put', endpoint, options);
Route.delete = (endpoint, options) => process('delete', endpoint, options);

Route.pst = Route.post;
Route.del = Route.delete;
