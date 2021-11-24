'use strict';

let koaRouterRequire = require('@koa/router');
let handle = require('./route-handler');
let log    = Bento.Log;
let koaRouter = new koaRouterRequire();
let verbList = ['post','get','put','delete'];
let co     = require('co');

verbList.forEach(name => {
  koaRouter['_' + name] = koaRouter[name];
});

function process(verb, route, options) {
  return koaRouter['_' + verb](route, async (ctx, next) => {
    await co(function *() {
      //log.debug(`${ ctx.method } ${ ctx.path } | ${ ctx.auth.check() ? `${ ctx.auth.user.name() } <${ ctx.auth.user.email }> [ ${ ctx.auth.user.role.title } ]` : 'Guest' }`);

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
    });
  });
};

/**
 * Runs middleware like operations on the provided route options before executing
 * the request controller.method
 */
let Route = global.Route = Object.assign(koaRouter, {
  resource: require('./resource'),

  post : (endpoint, options) => process('post', endpoint, options),
  get  : (endpoint, options) => process('get', endpoint, options),
  put  : (endpoint, options) => process('put', endpoint, options),
  del  : (endpoint, options) => process('delete', endpoint, options)
});

Route.pst = Route.post;
Route.delete = Route.del;
