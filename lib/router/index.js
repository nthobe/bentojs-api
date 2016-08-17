'use strict';

let koaRouter = require('koa-router')();
let route     = require('./route');

/**
 * Runs middleware like operations on the provided route options before executing
 * the request controller.method
 * @class Route
 * @static
 */
let Route = GLOBAL.Route = () => {
  return koaRouter.routes();
};

/**
 * @property resource
 * @type     Function
 */
Route.resource = require('./resource');

/**
 * @method post
 * @param {string} endpoint
 * @param {object} options
 */
Route.post = Route.pst = (endpoint, options) => {
  koaRouter.post(endpoint, route(endpoint, options));
};

/**
 * @method get
 * @param {string} endpoint
 * @param {object} options
 */
Route.get = (endpoint, options) => {
  koaRouter.get(endpoint, route(endpoint, options));
};

/**
 * @method put
 * @param {string} endpoint
 * @param {object} options
 */
Route.put = (endpoint, options) => {
  koaRouter.put(endpoint, route(endpoint, options));
};

/**
 * @method delete
 * @param {string} endpoint
 * @param {object} options
 */
Route.delete = Route.del = (endpoint, options) => {
  koaRouter.delete(endpoint, route(endpoint, options));
};