'use strict';

let koaRouterRequire = require('@koa/router');
let route     = require('./route');

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

Route.routes = koaRouter.routes;
Route.resource = require('./resource');

Route.post = Route.pst = (endpoint, options) => {
  koaRouter.post(endpoint, route(endpoint, options));
};

Route.get = (endpoint, options) => {
  koaRouter.get(endpoint, route(endpoint, options));
};

Route.put = (endpoint, options) => {
  koaRouter.put(endpoint, route(endpoint, options));
};

Route.delete = Route.del = (endpoint, options) => {
  koaRouter.delete(endpoint, route(endpoint, options));
};
