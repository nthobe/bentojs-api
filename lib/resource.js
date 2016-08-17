'use strict';

let error = Bento.Error;

Bento.Resource = function(name) {
  let resourceName = name.toLowerCase();
  let Model        = Bento.model(name);
  let resource     = {};

  /**
   * @method index
   * @return {Array}
   */
  resource.index = function *() {
    let result = yield Model.find(resource._options(this.query));
    if (result) {
      return result;
    }
    return [];
  };

  /**
   * Stores a record with the provided model.
   * @method store
   * @return {Object}
   */
  resource.store = function *() {
    let model = new Model(this.payload);

    model._actor = this._actor;
    yield model.save();

    // ### Redux Action

    let payload = {};

    payload.actionType    = resourceName + ':stored';
    payload[resourceName] = model.toJSON();

    Bento.IO.redux(payload);

    return model;
  };

  /**
   * Returns a record based on the provided id.
   * @method show
   * @param  {Mixed} id
   * @return {Object}
   */
  resource.show = function *(id) {
    let result = yield Model.findById(id);
    if (!result) {
      throw error.parse({
        code    : resourceName.toUpperCase() + '_NOT_FOUND',
        message : 'We could not find a resource record with the id provided'
      }, 404);
    }
    return result;
  };

  /**
   * Updates a record based on the provided id and data.
   * @method update
   * @param  {Mixed}  id
   * @return {Object}
   */
  resource.update = function *(id) {
    let model = yield Model.findById(id);
    let data  = this.payload;

    // ### Verify Resource Exists

    if (!model) {
      throw error.parse({
        code    : resourceName.toUpperCase() + '_NOT_FOUND',
        message : 'Could not find resource requested for update'
      }, 404);
    }

    // ### Verify Ownership

    yield resource._hasAccess(this.auth.user, model);

    // ### Update Data

    for (let key in data) {
      if (model.hasOwnProperty(key)) {
        model[key] = data[key];
      }
    }

    model._actor = this._actor;
    yield model.update();

    // ### Redux Action

    let payload = {};

    payload.actionType    = resourceName + ':updated';
    payload[resourceName] = model.toJSON();

    Bento.IO.redux(payload);

    return model;
  };

  /**
   * Deletes a record based on the provided id.
   * @method delete
   * @param  {Mixed} id
   */
  resource.delete = function *(id) {
    let model = yield Model.findById(id);

    // ### Verify Resource Exists

    if (!model) {
      throw error.parse({
        code    : resourceName.toUpperCase() + '_NOT_FOUND',
        message : 'Could not find resource requested for deletion'
      }, 404);
    }

    // ### Verify Ownership

    yield resource._hasAccess(this.auth.user, model);

    // ### Delete Record

    model._actor = this._actor;
    yield model.delete();

    // ### Redux Action

    let payload = {};

    payload.actionType    = resourceName + ':deleted';
    payload[resourceName] = model.toJSON();

    Bento.IO.redux(payload);

    return model;
  };

  /**
   * By default resource controllers only allows the creator of the record
   * or an administrative user to make modifications.
   * @param  {User}   user
   * @param  {Object} model
   * @return {Void}
   */
  resource._hasAccess = function(user, model) {
    if (user.role !== 'admin') {
      throw error.parse({
        code    : 'ACCESS_DENIED',
        message : 'You do not have the required privileges edit this record'
      }, 401);
    }
  };

  /**
   * By default resource simply returns the original query provided.
   * @param  {Object} query
   * @return {Object}
   */
  resource._options = function(query) {
    return query;
  };

  return resource;
};
