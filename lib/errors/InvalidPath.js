class InvalidPath extends Error {
  constructor(path) {
    super(`The database path doesn't seem to exist: ${path}`);
  }
}

module.exports = InvalidPath;