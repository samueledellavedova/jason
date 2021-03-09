const { stat, readFile, writeFile, unlink } = require('fs').promises;
const { randomBytes } = require('crypto');
const InvalidCollection = require('../errors/InvalidCollection');

/**
 * Represents a set of utilities
 */
class Util {
  constructor() {}

  /**
   * Checks if a path exists
   * @param {String} path The path to check
   * @returns {Promise<Boolean>} Whether or not a path exists
   */
  static async exists(path) {
    try { await stat(path); return true; }
    catch (err) { return false; } 
  }

  /**
   * Reads a JSON file
   * @param {String} file The file's path
   * @returns {Promise<Array<Object>>} The file's content
   */
  static async read(file) {
    try { return JSON.parse(`${await readFile(file, { encoding: 'utf-8' })}`); }
    catch (err) { return []; }
  }

  /**
   * Writes content to a JSON file
   * @param {String} file The file's path
   * @param {Array<Object>} content The content to write
   * @returns {Promise<Array<Object>>} The file's content
   */
  static async write(file, content = []) {
    await writeFile(file, JSON.stringify(content, null, 2), { encoding: 'utf-8' });
    return content;
  }

  /**
   * Deletes a file and returns its content
   * @param {String} file The file's path
   * @returns {Promise<Array<Object>>} The file's content
   */
  static async remove(file) {
    let name = file.split('/');
    name = name[name.length - 1].slice(0, -5);

    const content = await this.read(file);

    try { await unlink(file); return content; }
    catch (err) { throw new InvalidCollection(name, file) }
  }

  /**
   * Generates a unique ID
   * @returns {String} The generated ID
   */
  static uid() {
    let idx = 256;
    const length = 32;
    const size = idx * length;
    const buffer = randomBytes(size);

    const hex = [];
    while (idx--) hex[idx] = (idx + 256).toString(16).substring(1);

    let string = '', number = (length + 1) / 2 | 0;
    if ((idx + number) > size) idx = 0;

    while (number--) string += hex[buffer[++idx]];

    return string.substring(0, length);
  }

  /**
   * Checks whether the item is an object 
   * @param {*} item The item to check
   * @returns {Boolean} Whether or not the item is an object
   */
  static isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Checks whether the item is an empty object, returns true if it's not an object
   * @param {*} item The item to check
   * @returns {Boolean} Whether or not the item is an empty object
   */
  static isEmpty(item) {
    return !this.isObject(item) ? true : Object.keys(item).length < 1;
  }
}

module.exports = Util;