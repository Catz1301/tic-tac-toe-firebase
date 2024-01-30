class DetailedError extends Error {
  constructor(message, details) {
    super(message);
    this.details = details;
    this.lineNumber = undefined;
    this.parentFunction = undefined;
    this.fileName = undefined;
  }
}