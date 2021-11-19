'use strict';

let handle = require('./route-handler');
let log    = Bento.Log;

/**
 * Creates a bento route that parses down to a valid koa-router configuration.
 * @param  {String} route   The routing path, we assign this to the context
 * @param  {Mixed}  options
 * @return {Void}
 */
module.exports = function route(route, options) {
  return async (ctx, next) => {
    if (!Bento.isTesting()) {
      log.debug(`${ ctx.method } ${ ctx.path } | ${ ctx.auth.check() ? `${ ctx.auth.user.name() } <${ ctx.auth.user.email }> [ ${ ctx.auth.user.role.title } ]` : 'Guest' }`);
    }

    options = handle.options(options);

    // ### Route Context
    // Add the route to the ctx.route of the request context.

    ctx.route = route;

    // ### Prepare Params & Payload
    // Prepares the incoming parameters and data payload before passing it onto the route handler.

    ctx.params  = await handle.params(ctx.params);
    ctx.payload = await handle.payload(ctx);

    // ### Verification Step
    // Make sure policies and required parameters has been verified.

    await handle.checkPolicies(ctx, options.policy);
    await handle.checkParameters(ctx, options.params);

    // ### Exectue Handler

    await handle.route(ctx, options);
  };
};
