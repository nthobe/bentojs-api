'use strict';

let parse = require('co-body');
let type  = Bento.Helpers.Type;
let error = Bento.Error;

class RouteHandler {

  /**
   * Prepares routing options into a valid routing object.
   * @param  {Mixed} opt
   * @return {Object}
   */
  options(opt) {
    if (type.isString(opt)) {
      return { uses : opt };
    }
    if (type.isFunction(opt)) {
      return { handler : opt };
    }
    if (type.isArray(opt)) {
      let handler = opt.pop();
      if (type.isString(handler)) {
        return { policy : opt, uses : handler };
      }
      return { policy : opt, handler : handler };
    }
    return opt;
  }

  /**
   * Prepares incoming routing parameters for injection into route handlers.
   * @param  {Object} data
   * @return {Array}
   */
  *params(data) {
    let params = [];
    if (data) {
      for (let key in data) {
        params.push(data[key]);
      }
    }
    return params;
  }

  /**
   * Parses the data payload of the incoming request.
   * @param  {Object} ctx The koa request context.
   * @return {Object}     Returns a object with the incoming data parameters.
   */
  *payload(ctx) {
    if (ctx.request.is('multipart/*')) {
      return ctx;
    }

    // ### Check Method
    // We only parse the body during certain request methods.

    let allowed = [ 'POST', 'PUT', 'PATCH' ];
    let method  = ctx.request.method;
    if (allowed.indexOf(method) === -1) {
      return {};
    }

    // ### Parse Context

    let payload = yield parse(ctx);
    if (!payload) {
      return {};
    }
    return payload;
  }

  /**
   * Validates a list of policies.
   * @param {Object} ctx  The koa request context.
   * @param {Mixed}  list Can be an array of policies or a single string.
   */
  *checkPolicies(ctx, list) {
    if (!list) {
      return;
    }
    if (type.isArray(list)) {
      for (let i = 0, len = list.length; i < len; i++) {
        yield validatePolicy(ctx, list[i]);
      }
    } else {
      yield validatePolicy(ctx, list);
    }
  }

  /**
   * Validates that required parameters exists on the request payload.
   * @param {Object} ctx      The koa request context.
   * @param {Array}  required
   */
  *checkParameters(ctx, required) {
    if (!required || !required.length) {
      return;
    }

    // ### Validate Required
    // Verify that the required parameters exists on the payload or add
    // them to the list of missing parameters.

    let missing = [];
    required.forEach((field) => {
      let isDeep   = field.match(/\./) ? true : false;
      let deepLink = isDeep ? field.split('.') : null;
      let isValid  = isDeep ? Object.keys(deepLink.reduce((obj, key) => { return (obj[key] || {}); }, ctx.payload)).length : ctx.payload[field];
      if (!isValid) {
        missing.push(field);
      }
    });

    if (missing.length) {
      throw error.parse({
        code    : `MISSING_REQUIRED_PARAMETER`,
        message : `The request is missing required parameter(s).`,
        data    : {
          params : missing
        }
      }, 400);
    }
  }

  /**
   * Routes the request to the proper handler.
   * @param  {Object} ctx     The koa request context.
   * @param  {Object} options Options to pass to the handler.
   */
  *route(ctx, options) {
    let result = null;
    let params = ctx.params;
    if (options.handler) {
      result = yield options.handler.apply(ctx, params);
    } else {
      result = yield loadController(ctx, params, options.uses);
    }
    send(ctx, result);
  }

}

// ### PRIVATE METHODS

/**
 * Validates the provided policy.
 * @param {String} policy
 */
function *validatePolicy(ctx, policy) {
  let handler = Bento.policy(policy);
  if (!handler) {
    throw error.parse({
      code    : `POLICY_NOT_FOUND`,
      message : `Required policy [${ policy }] has not been registered.`
    }, 500);
  }
  yield handler.call(ctx);
}

/**
 * Calls controller to handle a request.
 * @param  {Object} ctx  The koa request context.
 * @param  {Object} data The parameters submitted with the request.
 * @param  {String} uses Controller => Method target.
 * @return {Mixed}
 */
function *loadController(ctx, data, uses) {
  let split      = uses.split('@');
  let controller = split[0];
  let method     = split[1];
  let Controller = Bento.controller(split[0]);
  if (!Controller) {
    throw error.parse({
      code    : `CONTROLLER_NOT_FOUND`,
      message : `The controller ${ controller } has not been defined`
    }, 500);
  }
  if (!Controller[method]) {
    throw error.parse({
      code    : `METHOD_NOT_FOUND`,
      message : `${ controller } is missing the method ${ method }`
    }, 500);
  }
  return yield Controller[method].apply(ctx, data);
}

/**
 * Sends the handled result to the client.
 * @param {Object} ctx    The koa request context.
 * @param {Mixed}  result
 */
function send(ctx, result) {
  let redirectStatus = [ 301, 302, 303, 304, 307, 308 ];
  if (redirectStatus.indexOf(ctx.status) !== -1) {
    return result;
  }
  if (!result) {
    result = {
      status : 'success'
    };
  }
  ctx.body = result;
}

module.exports = new RouteHandler();
