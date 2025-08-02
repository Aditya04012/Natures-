const{promisify}=require('util');
const crypto=require('crypto');//sha-256
const jwt=require("jsonwebtoken");
const User=require("./../models/userModel");
const AppError=require("./../utils/ErrorApp");
const sendEmail=require("./../utils/email");

const catchAsync=fn=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }
  }

  const signToken=id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
     });
  }
  const createSendToken=(user,statusCode,res)=>{
    const token=signToken(user._id);
   
    res.cookie('jwt',token,{
        expires:new Date(Date.now()+process.env.JWT_EXPIRES_COOKIE_IN*24*60*60*1000),
        secure:true,
        httpOnly:true
    });
   
 res.status(statusCode).json({
     status:"success",
     token,
     data:{
         user
     }
 });
  }
  
exports.signup=catchAsync(async(req,res,next)=>{
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        role:req.body.role
     });

     createSendToken(newUser,201,res);

  
});

exports.login=catchAsync(async(req,res,next)=>{
    const{ email,password}=req.body;

    //1.check is email and password exist
     if(!email || !password){
      return  next(new AppError('Please provide email and password',400));
     }
       
    //2.check if user exist and password is correct
        const user=await User.findOne({email}).select('+password');
        //Note->we have to select() password manually bcz we have hidden by deselect in database so that is is not visible to user
        //console.log(user)
         //2.1->creating instance methord => a methord this is gonna be avilable on all documents  of a ceratin collection
         //which will compare hash password with orignal password or (databasePassword and enteredPassword)
           //like a class function is available to all is object or instance(USERMODEL or in userschema) 
        if(!user || !(await user.correctPassword(password,user.password))){
            return next(new AppError('Incorrect email or password ',401));
        }
 

    //3.if everything ok,send the token to client
    createSendToken(user,200,res);
        
});



exports.protect=catchAsync(async(req,res,next)=>{
    //1) getting token and check of its exist there
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token=req.headers.authorization.split(' ')[1];
            
        }
    if(!token){
        return next(new AppError("You are not LogedIn !Pleases log in to get access",401));
    }
    
    //2) verification token 
      

     const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);     //this verify function have callback f(x) has a third agument so we are using promisify built in function and not using callback bcz we are using async await everywhere 
      
    //3) check if user still exists 

       //if token is issued but user deleted itself ...so freshUser will be null (if user is deleted)
         
       const freshUser=await User.findById(decoded.id);
      if(!freshUser){
        return next(new AppError('The user belonging to this token does no longer exist',401));
      }

    //4)check if user changed password after the token was issued
        //using instance methord (userModel.js)
        if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('user recently changed password !pleases log in again',401));
        }  
        

        //GRANT ACCESS TO PROTECTED ROUTES
        req.user=freshUser;

        
    next();
})

exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{ 
        //roles is an array ['admin','lead-guide'] role='user'
        if(!roles.includes(req.user.role)){
            return next(new AppError("you do not have permission to perform this action",403));
        }

        next();
          
    }
}

exports.forgotPassword=catchAsync(async(req,res,next)=>{

    //1) find the email in DB..provoided by user
    const user=await User.findOne({email:req.body.email});
    //if email prvoided by user is not valid or not found
    if(!user){
        return next(new AppError(("There is no user found with this email address",404)));
    }
   //2)  Generate random string token 
    //this random token we provide to user and (save in DB for 10min as encripted string)...this string act as token for user
    //if(token==DBtoken)    then user can reset it password
      //else user can not reset it password 
     
      //Create a instance methord for createPasswordResetToken(in userModel)
        const resetToken=user.createPasswordResetToken();
       await user.save({validateBeforeSave:false}); //we have to save it manually in database bcz we are using intance methord
      
        //if we will call user.save() then  field like email and password are required in DB..but we need to save only 
        //token and exptoken so we will pass special methord which will off the validatores of DB(validateBeforeSave:false)

        //3) send it to user email


        try{
            const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}` ;
        const message=`Forgot your password ? Submit a patch req with new password and passwordConfirm to :${resetURL}.\n IF you didt forgot your password , please ignore this email!`
        await sendEmail({
          email:user.email,
          subject:'Your password reset token (valid for 10min)',
          message
        });
     res.status(200).json({
        status:"sucess",
        message:'Token sent to email!'
     });
        }catch(err){
           user.passwordResetToken=undefined;
           user.passwordResetExpires=undefined;
           await user.save({validateBeforeSave:false}); 

           return next(new AppError('There was an error sending the email.Try again later',500));
        }
       

});

exports.resetPassword=catchAsync(async(req,res,next)=>{
 //1) Get user token and compare with DB encrypted token string
   const stringToken =crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user=await User.findOne({passwordResetToken:stringToken,
    passwordResetExpires:{$gt:Date.now()}
 });
//2) if user exist and token is not expired yet 
    if(!user){
        return next(new AppError('Token is invalid or exp',400));
    }
//3) update ChangeAt property (middleware pre)
   
 //4) change password ,passconfirm etc propertirs manually
     user.password=req.body.password;
     user.passwordConfirm=req.body.passwordConfirm;
     user.passwordResetToken=undefined;
     user.passwordResetExpires=undefined;
     await user.save();// no need to disable validator bcz we have change all its properties
 //5)login User 

 createSendToken(user,200,res);

});
exports.updatePassword=catchAsync(async(req,res,next)=>{
    //1) Get user from the collection
        const user=await User.findById(req.user.id).select('+password');
        const {passwordCurrent,password,passwordConfirm}=req.body;
       console.log("current user",user);
    
    //2)check if Posted current password is correct
    if(!(await user.correctPassword(passwordCurrent,user.password,))){
      return next(new AppError("yourr Current Password is not correct",401));
    }
    
    //3)if so,update password
         user.password=password;
        user.passwordConfirm=passwordConfirm;
        await user.save();


    //4) Log user In,send JWT

    createSendToken(user,200,res);
    

});


