const AppError = require("../utils/ErrorApp");

const handleCastErrorDB=err=>{
  const message=`Invalid ${err.path}: ${err.value}`
  return new AppError(message,400);
};


const handleDublicateErrorDB=err=>{
  const name=err.keyValue.name;
  const message=`Dublciate field value ${name} please use aother value `;
  return new AppError(message,400)
}

const handleValidationErrorDB=err=>{
  const errors=Object.values(err.errors).map(el=>el.message);
  const message=`Invalid input data ${errors.join('. ')}`;
  return new AppError(message,400);
}

const  handleJWTError=()=>new AppError('Invalid token .Pleases log in again',401)


const handleExpiredJWTError=()=>new AppError('Your Token has been expired! Please login again',401)

const Errorproduction=(err,res)=>{

  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
}

const ErrorDev=(err,res)=>{
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
    err: err,
  });
}
module.exports=(err, req, res, next) => {
  //console.log(process.env.NODE_ENV);
//  console.log(err.isOperational)-->isOperational is not defined yet
  if (process.env.NODE_ENV.trim() == 'development') {
    ErrorDev(err,res);
  } else if (process.env.NODE_ENV.trim() =='production') {
    let error = { ...err, name: err.name, message: err.message, code: err.code };

     //1. CastError or invalid Id
     
    if(error.name=="CastError"){
      error= handleCastErrorDB(error); //operational error is defined by AppError class
    }
   
    if(error.name=="MongoError"|| error.code==11000){
      error=handleDublicateErrorDB(error);
    }
    console.log(error.name)
    if(error.name=="ValidationError"){
      error=handleValidationErrorDB(error)
    }

    if(error.name=="JsonWebTokenError"){
      error=handleJWTError();
    }

    if(error.name=="TokenExpiredError"){
      error=handleExpiredJWTError();
    }
     Errorproduction(error,res);
    
  }
}

