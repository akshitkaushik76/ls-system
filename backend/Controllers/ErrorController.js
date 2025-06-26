const customerror = require('./../Utils/Customerror');
const devErrors = (res,error) => {
     res.status(error.statusCode).json({
        status:error.status,
        message:error.message,
        stackTrace:error.stack,
        error:error
    });
}

const prodError = (res,error) => {
  if(error.isOperational) {
     res.status(error.statusCode).json({
        status:error.status,
        message:error.message
    });
  }
  else {
    res.status(500).json({//non operational errors
        status:'error',
        message:'Something went wrong! Please try again later.'
    });
  }
  }

const CastErrorHandler = (error)=>{
    const msg = `invalid value ${error.value} for the field : ${error.path}`
    const err = new customerror(msg,400);
    return err;
}
const duplicateKeyError = (error)=>{
  const msg = `the provided name with ${error.keyValue.emailid} exist already please choose a different value to proceed further`
  const err = new customerror(msg,400);
  return err;
}

const ValidationErrorHandler = (error)=>{
    const msg =  error.message;
    const err = new customerror(msg,400);
    return err;
}
module.exports = (error,req,res,next)=>{
    error.statusCode = error.statusCode|| 500;
    error.status = error.status || 'error';
    
    if(process.env.NODE_ENV === 'development') {
     devErrors(res,error);

    } else if(process.env.NODE_ENV === 'production') {
        // err = {...error};
        console.log(error);
        if(error.name === "CastError") {
            error = CastErrorHandler(error);
        }
        else if(error.code === 11000) {
            //console.log(error.KeyValue.emailid);
            error = duplicateKeyError(error);
        }
        else if(error.name === "ValidationError") {
            error = ValidationErrorHandler(error);
        }
         prodError(res,error);
    }
   
}