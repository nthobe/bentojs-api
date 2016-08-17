'use strict';

const error = Bento.Error;
const API   = Bento.Helpers.Case.toParam(Bento.config.api.name);

/*
 |--------------------------------------------------------------------------------
 | Redis Bucket
 |--------------------------------------------------------------------------------
 |
 | This class is written to simplify the management of redis stores by placing
 | them in categorized buckets. The inspiration for this class was based on
 | the bucket concept presented in AWS S3 file stores.
 |
 | @author Christoffer Rødvik <snapgravy@gmail.com>
 |
 */

class RedisBucket {

  /**
   * Sets up the redis bucket class.
   * @param  {Object} redis
   * @param  {String} store
   * @return {Void}
   */
  constructor(redis, store) {
    this.redis = redis;
    this.store = store;
  }

  /**
   * Registers a new value with the redis store.
   * @param {String} id
   * @param {String} val
   * @param {Number} [expire]
   */
  *set(id, val, expire) {
    yield this.redis.set((this.store + id), val);
    if (expire) {
      yield this.expire(id, expire);
    }
  }

  /**
   * Registers a new JSON object with the redis store.
   * @param {String} id
   * @param {Object} val
   * @param {Number} [expire]
   */
  *setJSON(id, val, expire) {
    yield this.set(id, JSON.stringify(val));
    if (expire) {
      yield this.expire(id, expire);
    }
  }

  /**
   * Returns a registered value from the redis store.
   * @param  {String} id
   * @return {String}
   */
  *get(id) {
    return yield this.redis.get(this.store + id);
  }

  /**
   * Returns a registered JSON object from the redis store.
   * @param  {String} id
   * @return {Object}
   */
  *getJSON(id) {
    let result = yield this.get(id);
    if (result) {
      return JSON.parse(result);
    }
    return null;
  }

  /**
   * Updates a JSON object with new data.
   * @param {String} id
   * @param {Object} data
   * @param {Number} [expire]
   */
  *putJSON(id, data, expire) {
    let stored = yield this.getJSON(id);
    if (!stored) {
      throw error.parse({
        code    : 'REDIS_BUCKET_NOT_FOUND',
        message : `The redis bucket ${ id } does not exist`
      }, 404);
    }
    yield this.setJSON(id, Object.assign(stored, data), expire);
  }

  /**
   * Deletes a redis key => value pair from the redis store.
   * @param  {String} id
   * @return {Object}
   */
  *del(id) {
    return yield this.redis.del(this.store + id);
  }

  /**
   * Updates, or sets an expiration timer on a registered key => value pair
   * in the redis store.
   * @param  {String} id
   * @param  {Number} timer
   * @return {Object}
   */
  *expire(id, timer) {
    return yield this.redis.expire((this.store + id), timer);
  }

  /**
   * Removes any expiration timer on the registered key => value pair
   * in the redis store.
   * @param  {String} id
   * @return {Object}
   */
  *persist(id) {
    return yield this.redis.persist(this.store + id);
  }

};

module.exports = function(redis, store) {
  return new RedisBucket(redis, API + ':' + store + ':');
};
