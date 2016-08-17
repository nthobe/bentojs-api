module.exports = function resource(endpoint, controller, options) {
  options = options || {};
  Route.post('/' + endpoint, {
    uses   : controller + '@store',
    params : options.params || []
  });
  Route.get('/' + endpoint,                               controller + '@index');
  Route.get('/' + endpoint + '/:id',                      controller + '@show');
  Route.put('/' + endpoint + '/:id', [ 'isAuthenticated', controller + '@update' ]);
  Route.del('/' + endpoint + '/:id', [ 'isAuthenticated', controller + '@delete' ]);
};
