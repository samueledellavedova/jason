const Path = require('path');
const Collection = require('./structures/Collection');
const Util = require('./structures/Util');
const InvalidPath = require('./errors/InvalidPath');
const InvalidCollections = require('./errors/InvalidCollections');

/**
 * Represents a Jason, JSON database manager with 0 dependencies
 * @property {Boolean} _initialized Whether or not the database has been initialized
 * @property {String} path The database's path, where the JSON collection files are saved
 * @property {Map<String, Collection>} collections The database's collections
 * @property {Array<String>} collections.names The database's collection names
 */
class Jason {
  /**
   * Constructs a Jason
   * @param {String} path The database's path, where the JSON collection files are saved
   * @param {Array<String>} [collections] The database's collection names
   */
  constructor(path, collections) {
    this._initialized = false;
    this.path = Path.resolve(path);
    this.collections = new Map();
    this.collections.names = collections;
  }

  /**
   * Initializes the database and loads the collections
   * @returns {Promise<void>} Nothing?
   */
  async connect() {
    if (!await Util.exists(this.path)) throw new InvalidPath(this.path);

    this._initialized = true;    
    if (this.collections.names) await this.load(this.collections.names);
  }

  /**
   * Loads the specified collections
   * @param {Array<String>} collections The collections to load, if some isn't found it will be created
   * @returns {Promise<void>} Nothing?
   */
  async load(collections) {
    if (!await Util.exists(this.path)) throw new InvalidPath(this.path);
    if (!Array.isArray(collections)) throw new InvalidCollections(collections);

    for (let collection of collections) {
      collection = `${collection}`;

      if (!collection.endsWith('.json'))
        collection = collection + '.json';

      const file = Path.join(this.path, collection);
      const name = collection.slice(0, -5);
      
      if (!await Util.exists(file)) await Util.write(file);
      if (!this.collections.names.includes(name)) this.collections.names.push(name);
      this.collections.set(name, new Collection(this, name));
    }
  }
  
  /**
   * Returns a collection matching a name
   * @param {String} name The collection's name
   * @returns {Collection | undefined} The collection that matches the name
   */
  collection(name) {
    return this.collections.get(name);
  }

  /**
   * Deletes a collection from the database, this action is irreversible
   * @param {String} collection The collection's name
   * @returns {Promise<Array<Object>>} The deleted collection
   */
  async delete(collection) {
    this.collections.delete(collection);
    this.collections.names = this.collections.names.filter(c => c !== collection);
    return await Util.remove(Path.join(this.path, `${!collection.endsWith('.json') ? collection + '.json' : collection}`));
  }

  /**
   * Deletes every existing collection from the database, this action is irreversible
   * @returns {Promise<Object>} An object containing each deleted collection
   */
  async destroy() {
    const collections = {};
    for (const collection of this.collections.values())
      collections[collection.name] = await this.delete(collection.name);
      
    return collections;
  }
}

module.exports = Jason;