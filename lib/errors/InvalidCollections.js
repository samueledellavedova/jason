class InvalidCollections extends Error {
  constructor(collections) {
    super();

    this.message = `The collections array doesn't seem to be valid: ${collections}\nExpected format: [ 'collection1', 'collection2', 'collection3' ]`;
  }
}

module.exports = InvalidCollections;