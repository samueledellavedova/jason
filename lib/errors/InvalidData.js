class InvalidData extends Error {
  constructor(type, array = false) {
    super(array ? `The data to write must be an array of plain objects or a plain object itself, received: ${type}` : `The data to write must be a plain object, received: ${type}`);
  }
}

module.exports = InvalidData;