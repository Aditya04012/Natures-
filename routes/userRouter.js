const express=require("express");
const authController=require("./../controllers/authControllers");
  const users=require("./../controllers/userControllers");
  //it will create routes like app();
  const router=express.Router();
  
  router.post('/signup',authController.signup)
  router.post('/login',authController.login)
  
  router.post('/forgotPassword',authController.forgotPassword);
  router.patch('/resetPassword/:token',authController.resetPassword);

  router.patch('/updateMyPassword',authController.protect,authController.updatePassword);

 router.patch('/updateMe',authController.protect,users.updateMe);                       
 router.delete('/deleteMe',authController.protect,users.deleteMe);  
  //creating user routes
  router.route("/").get(users.getAllusers).post(users.createUser);
  router.route("/:id").get(users.getUser).patch(users.updateUser).delete(users.deleteUser);
  module.exports=router;