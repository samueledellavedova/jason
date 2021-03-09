const Util = require('./Util');

/**
 * Represents a database operator, does all of the dirty work
 */
class Operator {
  constructor() {}

  /**
   * Finds matches between an object and a filter, returns false if there's at least one property that doesn't match
   * @param {Object} object The object to compare
   * @param {Object} filter The filter
   * @param {Boolean} [matched] Whether there isn't at least one property that doesn't match
   * @returns {Boolean} Whether or not all of the filter's properties match with the object's properties
   */
  static _match(object, filter, matched = true) {
    for (const [ key, value ] of Object.entries(filter)) {
      if (Util.isObject(value)) {
        if (Util.isEmpty(value) && !object[key]) matched = false;
        return this._match(object[key], value, matched);
      } else {
        if (!object || object[key] !== filter[key]) matched = false;
      }
    }
    return matched;
  }

  /**
   * Filters a collection, returns the documents that match with a filter
   * @param {Array<Object>} collection The collection
   * @param {Object} [filter] The query filter
   * @param {Boolean} [many] Whether to filter only the first match or all the matching documents
   * @returns {Array<Object>} The filtered collection
   */
  static _filter(collection, filter, many = true) {
    if (Util.isEmpty(filter)) return !many ? [ collection[0] ] : collection;
    
    const results = [];

    for (const document of collection)
      if (!many && results.length === 1) return results;
      else if (this._match(document, filter)) results.push(document);

    return [ ...(new Set(results)) ];
  }

  /**
   * Merges multiple objects
   * @param {Object} object The first object
   * @param {...Object} sources The other objects to merge
   * @returns {Object} The merged object
   */
  static _merge(object, ...sources) {
    if (!sources.length) return object;
    const source = sources.shift();

    if (Util.isObject(object) && Util.isObject(source))
      for (const key in source)
        if (!Util.isObject(source[key])) Object.assign(object, { [key]: source[key] });
        else {
          if (!object[key]) Object.assign(object, { [key]: {} });
          this._merge(object[key], source[key]);
        }

    return this._merge(object, ...sources);
  }
  
  /**
   * Performs the specified operation
   * @param {String} operation The operation
   * @param {Array<Object>} collection The collection
   * @param {Object} [filter] The filter to apply
   * @param {Object | undefined} [data] The data to edit in one or more documents
   * @param {Boolean} [many] Whether to filter only the first match or all the matching documents
   * @returns {Object} The entire collection, the filtered collection, the updated documents and the deleted documents
   */
  static _do(operation, collection, filter, data, many = true) {
    const filtered = this._filter(collection, filter, many);
    const updated = [];
    const deleted = [];

    if (operation === 'find') return { collection, filtered };

    for (let i = filtered.length - 1; i >= 0; i--) {
      const document = filtered[i];
      const j = collection.indexOf(document);
      
      if (j < 0) continue;

      if (operation === 'update') { collection[j] = this._merge(document, data); updated.push(collection[j]); }
      else if (operation === 'delete') { deleted.push(collection.splice(j, 1)[0]); } 
      else break;
    }

    return { collection, filtered, updated, deleted };
  }

  /**
   * Searches for documents matching a filter
   * @param {Array<Object} collection The collection
   * @param {Object} [filter] The query filter
   * @param {Boolean} [many] Whether to return only the first match or all the matching documents
   * @returns {Object} The entire collection and the filtered collection
   */
  static find(collection, filter, many = true) {
    return this._do('find', collection, filter, undefined, many);
  }
  
  /**
   * Updates documents matching a filter
   * @param {Array<Object>} collection The collection
   * @param {Object} [filter] The query filter
   * @param {Object} data The data to edit in one or more documents
   * @param {Boolean} [many] Whether to update only the first match or all the matching documents
   * @returns {Object} The entire collection, the filtered collection and the updated documents
   */
  static update(collection, filter, data, many = true) {
    return this._do('update', collection, filter, data, many);
  }

  /**
   * Deletes documents matching a filter
   * @param {Array<Object>} collection The collection
   * @param {Object} [filter] The query filter
   * @param {Boolean} [many] Whether to delete only the first match or all the matching documents
   * @returns {Object} The entire collection, the filtered collection and the deleted documents
   */
  static delete(collection, filter, many = true) {
    return this._do('delete', collection, filter, undefined, many);
  }
}

module.exports = Operator;