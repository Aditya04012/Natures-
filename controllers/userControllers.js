const AppError = require("../utils/ErrorApp");
const User=require("./../models/userModel");

const catchAsync=fn=>{
  return (req,res,next)=>{
      fn(req,res,next).catch(next);
  }
}
//             req.body,  ['name','email']
const filterObj=(obj,...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el]=obj[el];
  });
  return newObj
}



exports.getAllusers=catchAsync(async(req,res,next)=>{
  const users=await User.find();
    res.status(200).json({
      status:"success",
      data:{
        users
      }
    });
  });

exports.updateMe=catchAsync(async(req,res,next)=>{
   //1) error if user POSTS password data
      const {password ,passwordConfirm}=req.body;
      if(password || passwordConfirm){
        return next(new AppError('This route is not for password update .Please use /updateMyPassword',400));
      }

   //2) update user document
   const filterBody=filterObj(req.body,'name','email');
   const updatedUser=await User.findByIdAndUpdate(req.user.id,filterBody,{
    runValidators:true,new:true
   });
   res.status(200).json({
    status:"Success",
    data:{
      updatedUser
    }
   })

});
exports.deleteMe=catchAsync(async(req,res,next)=>{
const user=await User.findByIdAndUpdate(req.user.id,{active:false}).select("+active");
console.log(user);
res.status(204).json({
  status:"success",
  data:null
})
});




  exports.createUser=async(req,res)=>{
    const {name,email,password,passwordConfirm}=req.body;
    const user=await User.create({name,email,password,passwordConfirm});
    res.status(201).json({
      status:"success",
      data:{
        user
      }
    });
  };
  exports.getUser=(req,res)=>{
    res.status(500).json({
      status:"fail",
      message:'get single Users are not defined yet'
    });
  };
  exports.updateUser=(req,res)=>{
    res.status(500).json({
      status:"fail",
      message:'update Users are not defined yet'
    });
  };
  exports.deleteUser=(req,res)=>{
    res.status(500).json({
      status:"fail",
      message:' delete Users are not defined yet'
    });
  };
  
  
  