const fs = require("fs");
const express = require("express");
const morgan=require("morgan");
const AppError=require("./utils/ErrorApp");
const globalErrorHandler=require('./controllers/errorControllers');
const tourRouter=require( "./routes/tourRoutes");
const userRouter=require("./routes/userRouter");
const rateLimit=require("express-rate-limit");
const xss=require('xss-clean');
const mongoSanitize=require('express-mongo-sanitize');
const hpp=require('hpp');
const app = express();

if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many requestsfrom this IP ,please try again in an hour'
})

app.use('/api',limiter); 

app.use(express.json());

app.use(mongoSanitize());

app.use(xss());
app.use(hpp());



app.use("/api/v1/tours",tourRouter);
app.use("/api/v1/users",userRouter);



app.all("*",(req,res,next)=>{
  next(new AppError(`cant find ${req.originalUrl} on the server`,404));
});



app.use(globalErrorHandler);

module.exports=app;
