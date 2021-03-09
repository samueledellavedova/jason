const { join } = require('path');
const Jason = require('..');
const Util = require('./Util');
const Operator = require('./Operator');
const InvalidData = require('../errors/InvalidData');
const InvalidID = require('../errors/InvalidID');

/**
 * Represents a Collection
 * @property {Jason} db The database to which the collection belongs
 * @property {String} name The collection's name
 * @property {String} _file The collection's JSON file path
 */
class Collection {
  /**
   * Constructs a Collection
   * @param {Jason} db The database to which the collection belongs
   * @param {String} name The collection's name
   */
  constructor(db, name) {
    this.db = db;
    this.name = name;
    this._file = join(this.db.path, `${this.name}.json`);
  }

  /**
   * Counts the number of documents in the collection
   * @returns {Promise<Number>} The number of documents in the collection
   */
  async count() {
    return (await Util.read(this._file, false)).length;
  }
  
  /**
   * Adds one or more documents to the collection
   * @param {Array<Object> | Object} data The document(s) to be added
   * @returns {Promise<Array<Object>>} The entire collection
   */
  async create(data) {
    if (typeof data !== 'object') throw new InvalidData(typeof data, true);

    const collection = await Util.read(this._file);
    const createOne = async document => {
      const id = [ null, undefined ].includes(document._id) ? Util.uid() : document._id;
      delete document._id;
      document = { _id: id, ...document };

      if (await this.findOne({ _id: document._id })) throw new InvalidID(this.name, document._id);
      else collection.push(document);
    };

    if (Array.isArray(data))
      for (const document of data) await createOne(document);
    else
      await createOne(data);

    return await Util.write(this._file, collection);
  }

  /**
   * Searches for documents matching a filter
   * @param {Object} [filter] The query filter (if none or empty object it will return the entire collection)
   * @param {Boolean} [many] Whether to return only the first match or all the matching documents
   * @returns {Promise<Array<Object>>} The results that match the filter
   */
  async find(filter, many = true) {
    const { filtered } = Operator.find(await Util.read(this._file), filter, many);
    return filtered;
  }

  /**
   * Searches for the first document matching a filter
   * @param {Object} [filter] The query filter
   * @returns {Promise<Object | undefined>} The first result that matches the filter
   */
  async findOne(filter) {
    return (await this.find(filter, false))[0];
  }

  /**
   * Searches for a document matching an ID
   * @param {String} id The document's ID
   * @returns {Promise<Object | undefined>} The document that matches the ID
   */
  async findByID(id) {
    return await this.findOne({ _id: id });
  }

  /**
   * Updates one or more documents in the collection
   * @param {Object} [filter] The query filter (if none or empty object it will update the entire collection)
   * @param {Object} data The object containing the data to update
   * @param {Boolean} [many] Whether to update only the first match or all the matching documents
   * @returns {Promise<Array<Object>>} The updated documents
   */
  async update(filter, data, many = true) {
    if (!Util.isObject(data)) throw new InvalidData(Array.isArray(data) ? 'array' : typeof data);
    const { collection, updated } = Operator.update(await Util.read(this._file), filter, data, many);

    await Util.write(this._file, collection);
    return updated;
  }

  /**
   * Updates the first document matching a filter
   * @param {Object} [filter] The query filter
   * @param {Object} data The object containing the data to update
   * @returns {Promise<Object | undefined>} The updated document
   */
  async updateOne(filter, data) {
    return (await this.update(filter, data, false))[0];
  }

  /**
   * Updates a document matching an ID
   * @param {String} id The document's ID
   * @param {Object} data The object containing the data to update
   * @returns {Promise<Object | undefined>} The updated document
   */
  async updateByID(id, data) {
    return await this.updateOne({ _id: id }, data);
  }

  /**
   * Deletes one or more documents in the collection
   * @param {Object} [filter] The query filter (if none or empty object it will delete the entire collection)
   * @param {Boolean} [many] Whether to delete only the first match or all the matching documents
   * @returns {Promise<Array<Object>>} The deleted documents
   */
  async delete(filter, many = true) {
    const { collection, deleted } = Operator.delete(await Util.read(this._file), filter, many);

    await Util.write(this._file, collection);
    return deleted;
  }
  
  /**
   * Deletes the first document matching a filter
   * @param {Object} [filter] The query filter
   * @returns {Promise<Object | undefined>} The deleted document
   */
  async deleteOne(filter) {
    return (await this.delete(filter, false))[0];
  }

  /**
   * Deletes a document matching an ID
   * @param {String} id The document's ID
   * @returns {Promise<Object | undefined} The deleted document
   */
  async deleteByID(id) {
    return await this.deleteOne({ _id: id });
  }
}

module.exports = Collection;