import Errors from "../lib/customError.js";

// eslint-disable-next-line no-unused-vars
async function errorHandler(err, req, res, next) {
  res.setHeader("Content-Type", "application/json");

  console.log(err);
  console.log("----------");
  console.log(err.message);

  if (err instanceof Errors.validationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      validationErrors: err.validationErrors,
    });
  }

  if (err instanceof Errors.customError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Errors.dbError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      dbErr: err.dbErr,
    });
  }

  return res
    .status(500)
    .json({ success: false, message: req.message.fail.internalServerError });
}

export default errorHandler;
