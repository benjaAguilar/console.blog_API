import Errors from "../lib/customError.js";

async function errorHandler(err, req, res) {
  console.log(err);
  console.log("----------");
  console.log(err.message);

  if (err instanceof Errors.validationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      validationErrors: err.validationErrors,
    });

    return;
  }

  if (err instanceof Errors.customError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });

    return;
  }

  if (err instanceof Errors.dbError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      dbErr: err.dbErr,
    });

    return;
  }

  res.status(500).json({ success: false, message: "Internal server Error" });
}

export default errorHandler;
