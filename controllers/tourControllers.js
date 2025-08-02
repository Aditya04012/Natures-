const fs=require("fs");
const Tour=require("./../models/tourModel");



exports.aliasTopTour=(req,res,next)=>{
req.query.limite='5';
req.query.sort='-ratingsAverage,price';
req.query.fields='name,price,difficulty,summary,ratingAverage';
next();
};
 //
const catchAsync=fn=>{
  return (req,res,next)=>{
      fn(req,res,next).catch(next);
  }
}


// 2) route handler
exports.getAllTour =catchAsync(async(req, res,next) => {
  
    //1 filtering
   
    const queryObj={...req.query};
    const exclude=["limite","sort","page","fields"];
    exclude.forEach(el=>delete queryObj[el]);
   //console.log(req.query,queryObj);
   
    //2 advance filtering
  let queryStr=JSON.stringify(queryObj);
    queryStr=queryStr.replace(/\b(gte|gt|lt|lte)\b/g,match=>`$${match}`);//  /g is important without g it will repace only first occurence with g it replace all the ocuurence present
    //console.log(JSON.parse(queryStr));
   let tours= Tour.find(JSON.parse(queryStr));

   
  
     //3 Sorted BY
    if(req.query.sort){
      const sortby=req.query.sort.split(",").join(" ");
     tours= tours.sort(sortby);
    }else{
      tours=tours.sort('-createdAt')
    }
   //4 field limiting
   if(req.query.fields){
    const fieldsBy=req.query.fields.split(",").join(" ");
    tours=tours.select(fieldsBy);
   }else{
    tours=tours.select("-__v");
   }
   //5 pagination
    const page=req.query.page*1 ||1;//string--->no
    const limit=req.query.limite*1||100;
   const skipval=(page-1)*limit;

   tours=tours.skip(skipval).limit(limit);

   if(req.query.page){
    const totaltour=await Tour.countDocuments();
    if(skip>=totaltour)throw new Error("page does not exist");
   }
     
    tours=await tours;//imp let tours= await Tour.find(JSON.parse(queryStr));(it will not work bcsz u are modifing value and waiting)
    res.status(200).json({
      status: "success",
      result: tours.length,
      data: {
        tours
      }
    });

})
  
exports.getTour =catchAsync(async (req, res) => { 

  //console.log(req.params); 
const id = req.params.id ;                
//let tour= await Tour.findById(id);
let tour=await Tour.findOne({_id:id});
res.status(200).json({
  status: "success",
  data: {
    tour
  } 
});

})



exports.createTour = catchAsync(async(req, res) => {
  
      //console.log(req.body);
 //const newTour=new Tour({});
 
 const newTour=await Tour.create(req.body);
 newTour.save()
 res.status(201).json({
   status: "success",
   data: {
     tour: newTour
   }
});

})
//Pipeline aggregation

exports.updateTour = catchAsync(async(req, res) => {
  
    const tour= await Tour.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true//run the validator of schema
     });
     res.status(200).json({
      status: "success",
      data: {
        tour: tour
      }
    });

   
})

exports.deleteTour =catchAsync(async (req, res) => {

   await Tour.deleteOne({_id:req.params.id});
    res.status(204).json({ //204-->no data
      status: "success",
      data: null
    });
  

})
exports.createTourStats=catchAsync(async(req,res)=>{
  
  const state= await Tour.aggregate([
   {
    $match:{ratingsAverage:{$gte:4.5}}
   },
   {
    $group:{
     _id:'$difficulty',
     avgRating:{$avg:'$ratingsAverage'},
     avgPrice:{$avg:'$price'},
     minPrice:{$min:'$price'},
     maxPrice:{$max:'$price'},
     numTour:{$sum:1},
     numRatings:{$sum:'$ratingsQuantity'}
    }
   },
   {
    $sort:{avgPrice:1}//it will sort on basis of avgPrice field
  },/*{
    $match:{_id:{$ne:'EASY'}}//we are excluding EASY (deselecting)
  }*/
  ]);

  res.status(200).json({
     status:'susscess',
     data:{
      state
     }
  });


 
})
//implements a function to calculate the  busyest month of a yr

exports.getMonthlyPlan=catchAsync(async(req,res)=>{
  
    const year =req.params.year*1;
    const plan=await Tour.aggregate([
      {
    $unwind:"$startDates"
      },
      {
        $match:{
          startDates:{
            $gte: new Date(`${year}-01-01`),
            $lte:new Date(`${year}-12-31`)
          }
        }
      },{
      $group:{
        _id:{$month:'$startDates'},
        numTourStart:{$sum:1},
        tours:{$push:"$name"}//push  is used to create an array
      }
    },
    {
     $addFields:{month:"$_id"}
    },{
      $project:{
        _id:0   //0 means hide _id and 1 visible id
      }
    },{
      $sort:{ numTourStart:-1}
    },{
      $limit:6
    }
    ]);


    res.status(200).json({
      status:'susscess',
      data:{
       plan
      }
   });
 

  
})