const mongoose=require('mongoose');
const crypto=require('crypto');
const validator=require('validator');
const bcrypt=require("bcrypt")
const UserSchema=new mongoose.Schema({
  name:{
    type:String,
    require:[true,'Please provide Name'],
    maxlength:[30,'A user must have equal or less than 30 char'],
    minlength:[5,'A user must have equal or grater than 5 char']
  },
  email:{
    type:String,
    require:[true,'name must be required'],
    unique:true,
    lowercase:true,
    validate:[validator.isEmail,'Please provide a valid email']
  },
  photo:String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password:{
    type:String,
    require:[true,'Please Provide a password'],
    minlength:8,
    select:false
  },
  passwordConfirm:{
    type:String,
    require:[true,'please confirm your password'],
    validate:{
      validator:function(el){
        return el===this.password;
      },
       message:"Password is not the same!"
    }
  },
  PasswordChangedAt:Date,
  passwordResetToken:String,
  passwordResetExpires:Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }
});

UserSchema.pre('save',async function(next){
if(!this.isModified('password'))return next();
 this.password=await bcrypt.hash(this.password,11);
 this.passwordConfirm=undefined;
next();
});
//
UserSchema.pre('save',function(next){
if(!this.isModified('password')|| this.isNew)return next();
this.PasswordChangedAt=Date.now()-1000;
next();
});

UserSchema.pre(/^find/, function(next) {
  this.find({ active: true });
  next();
});


UserSchema.methods.correctPassword=async function(candidatepassword,userpassword){
  //this.password is not avilable bcz we have deselct is by select:false so that it is not visible to user
  return await bcrypt.compare(candidatepassword,userpassword);

}



UserSchema.methods.changedPasswordAfter=function(JWTTimestamp){
    if(this.PasswordChangedAt){
      const changedtimestamp=parseInt(this.PasswordChangedAt.getTime()/1000,10);
      console.log(changedtimestamp,JWTTimestamp);

      //token was issued< time to change password
      //if token is isuued 1hr ago< pass changed after 2hr -->means true password is changed!
      return JWTTimestamp<changedtimestamp;
    }

   //false means not changed
  return false;
}
UserSchema.methods.createPasswordResetToken=function(){
  //create 2 fields in DB and we will save it by this function
  //1) passwordResetToken-->to save hash string in DB
   //2) passwordResetExpires--> passwordResetToken expires in?


   const resetToken=crypto.randomBytes(32).toString('hex');
   //resettoken we will send it to user
 
  this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');//this we will save in DB
  this.passwordResetExpires=Date.now()+10*60*1000;//10 mins
 return resetToken;
}

const User=mongoose.model('user',UserSchema);
module.exports=User;