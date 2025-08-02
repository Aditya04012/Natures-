const mongoose=require("mongoose");
const User=require("./userModel");
const tourSchema=new mongoose.Schema({
    name:{
      type:String,
      required:[true,'A tour must have a name'],
      unique:true,
      maxlength:[40,'A tour name must have less or equal 40 char'],
      minlength:[10,'A tour name must have more or equal 10 char'],
    },
    duration:{
      type:Number,
      required:[true,"duration must req"]
    },
    maxGroupSize:{
      type:Number,
      required:[true,"maxGroupSize must req"]
    },
    difficulty:{
      type:String,
      required:[true,'A tour must have a difficulty'],
      //enum:['easy','medium','difficult']
      enum:{
        values:['easy','medium','difficult'],
        message:'Difficulty is either easy,medium and difficult'
      }
    },

    ratingsAverage:{
      type:Number,
      default:4.7,
      min:[1,'rating must be above 1.0 or equal 1'],
      max:[5,'rating must be below 5 equal' ]
    },
    ratingsQuantity:{
      type:Number,
      default:4.7
    },
    price:{
      type:Number,
      required:[true,'a tour must have a price']
    },
    priceDiscount:{
      type:Number,
      validate:{
        validator:function(val){
          return val<this.price;
        },
        message:"Discount price should be below then regular price"
      }
    },
    summary:{
      type:String,
      trim:true,
      required:true
    },
    description:{
      type:String,
      trime:true
    },
    imageCover:{
      type:String,
      trim:true,
      required:true
    },
    images:[String],
    createdAt:{
      type:Date,
      default:Date.now()
    },
    startDates:[Date],
    secretTour:{
      type:Boolean,
      default:false
    },
    startLocation:{
      //GeoJSON
      type:{
           type:String,
           default:'Point',
           enum:['Point']
      },
      coordinates:[Number],
      address:String,
      description:String
    },
    locations:[
      {
         type:{
            type:String,
            default:'Point',
           enum:['Point']
         },
      coordinates:[Number],
      address:String,
      description:String,
      day:Number
      }
    ],
    guides:[
      {
         type:mongoose.SchemaTypes.ObjectId,
         ref:'user'
      }
   ]
  },{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  });
  tourSchema.virtual('durationWeeks').get(function(){
     return this.duration/7;
  });

/*
embedding
tourSchema.pre('save',async function(next){
  const guidesPromises=this.guides.map(async id=>await User.findById(id));
   this.guides=await Promise.all(guidesPromises);
  next();
})
  */

  /*
                document middleware

  tourSchema.pre('save',function(next){
    //console.log(this)  this ->will returen the obj
    console.log("Will save the documents");
   next();
  });
  tourSchema.post('save',function(doc,next){
    console.log(doc);
    next();
  });*/


tourSchema.pre(/^find/,function(next){
  this.populate({
    path:'guides',
    select:'-__v -role'
  })
  next();
});

  
           // query middleware

  tourSchema.pre('find',function(next){
    this.find({secretTour:{$ne:true}})
   next();
 });


tourSchema.pre('aggregate',function(next){

  //console.log(this.pipeline());
this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
next();
});




  const Tour=mongoose.model('Tour',tourSchema);
  module.exports=Tour;