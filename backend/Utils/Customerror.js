class CustomError extends Error{
  constructor(message,statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode<500 && statusCode>=400 ?'fail':'internal server error';
    this.isOperational = true;
    Error.captureStackTrace(this,this.constructor);
  }
 
}
module.exports = CustomError;