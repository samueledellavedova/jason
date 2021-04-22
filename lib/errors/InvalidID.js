class InvalidID extends Error {
  constructor(collection, id) {
    super(`A document with ID ${id} already exists in collection ${collection}`);
  }
}

module.exports = InvalidID;