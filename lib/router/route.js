'use strict';

let moment = require('moment');
let handle = require('./route-handler');
let log    = Bento.Log;

/**
 * Creates a bento route that parses down to a valid koa-router configuration.
 * @param  {String} route   The routing path, we assign this to the context
 * @param  {Mixed}  options
 * @return {Void}
 */
module.exports = function route(route, options) {
  return function *() {
    if (!Bento.isTesting()) {
      log.debug(`${ this.method } ${ this.path } | ${ this.auth.check() ? `${ this.auth.user.name() } <${ this.auth.user.email }> [ ${ this.auth.user.role.title } ]` : 'Guest' }`);
    }

    options = handle.options(options);

    // ### Route Context
    // Add the route to the this.route of the request context.

    this.route = route;

    // ### Prepare Params & Payload
    // Prepares the incoming parameters and data payload before passing it onto the route handler.

    this.params  = yield handle.params(this.params);
    this.payload = yield handle.payload(this);

    // ### Verification Step
    // Make sure policies and required parameters has been verified.

    yield handle.checkPolicies(this, options.policy);
    yield handle.checkParameters(this, options.params);

    // ### Exectue Handler

    yield handle.route(this, options);
  };
};
