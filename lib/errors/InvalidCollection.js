class InvalidCollection extends Error {
  constructor(collection, path) {
    super(`The collection ${collection} couldn't be found at: ${path}`);
  }
}

module.exports = InvalidCollection;