class customError extends Error {
  constructor(message, statusCode) {
    super(message), (this.statusCode = statusCode);
  }
}

class validationError extends Error {
  constructor(message, statusCode, validationErrors) {
    super(message), (this.statusCode = statusCode);
    this.validationErrors = validationErrors;
  }
}

class dbError extends Error {
  constructor(message, statusCode, dbErr) {
    super(message), (this.statusCode = statusCode);
    this.dbErr = dbErr;
  }
}

const Errors = {
  customError,
  validationError,
  dbError,
};

export default Errors;
