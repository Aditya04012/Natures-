const express=require("express");
const {protect,restrictTo}=require("./../controllers/authControllers");
const router=express.Router();
const {getAllTour,createTour,getTour,updateTour,deleteTour,aliasTopTour,createTourStats,getMonthlyPlan}=require("./../controllers/tourControllers")

//creating tour routes
router.param('id',(req,res,next,val)=>{
console.log("req id is: "+val);
next();
});

//Routers
router.route('/top-5-cheap').get(aliasTopTour,  getAllTour);
router.route('/tour-stats').get(createTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route("/").get(protect,getAllTour).post(createTour);
router.route("/:id").get(getTour).patch(updateTour).delete(protect,restrictTo('admin','lead-guide'),deleteTour);

module.exports=router;