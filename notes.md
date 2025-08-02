
Data modelling is process of taking unstructure data genrated by real world senario and then structure into logical data
model ,we do it by some set of criteria

modelling unstructure data into structure data maintaing realtionship b/w them.


                        1)Different types of relationship b/w data

1)one to one relationship-->  one field can only have one value (one movie-->one name)

2)one to many-->  one field can have many values,

     1) Few --->one movie can win few awards(limited to <100)
     2) many-->one movie can have thousands of reviews etc
     3)Ton --->something to grow almost to infinity 

3) many to many -->many fields can have many values (ont teacher can teach many students and students can have many teachers)




                             Referencing vs Embedding
                            (normalized) vs (denormalized)

  ![](/refvsembading.png)


1) we keep to realated data set and             1) we keep related data at one place,
 all documenet sperated.all data nicely            embedding the related document  right into main document
 sperated 

 2)we use actual Ids in order to create         2) no need for Ids we have main data and realted data 
 references connecting two diffrent                at one place
 models or related data                               

 actor:{                                         {
    ObjectId('223');                               main data and related data
    Object('234');                               }

 }
 {
    object('223')
 }
 {
    object('234')
 }

 3)This is also called child Referencing

 4)IN RDMS all data is represnted in normalized form

 5) performance:its easier to query each doc on its own         5)performance:we can get all the informatiob in one query

 6) we need 2 queries to get data from referenced documenet     6)impossible to query the embedding doc on its own


 We should  normalized or denormalized data ?

  
    When to EMBED and WHEN TO REFERENCE ? A PRATICAL FRAMEWORK!

+-------------------------+------------------+-------------------+
| Criteria               | Embedding        | Referencing       |
+------------------------+------------------+-------------------+
| 1. Relationship Type   | 1:FEW, 1:MANY     | 1:MANY, 1:TON,    |
|                        |                  | MANY:MANY         |
| Example                | Movies + Images  | Movies + Reviews  |
+------------------------+------------------+-------------------+
| 2. Access Patterns     | Mostly Read      | Frequently Updated|
|                        | Data doesn't     | Data changes fast |
|                        | change often     | Low read/write    |
| Example                | Movies + Images  | Movies + Reviews  |
+------------------------+------------------+-------------------+
| 3. Data Closeness      | Strongly related | Queried separately|
|                        | together         |                   |
| Example                | User + Email     | Movies + Images   |
+------------------------+------------------+-------------------+





        TYPES OF Referencing


![Referencing Types](/type%20of%20ref.png)



+----------------------+----------------------------+----------------------------+
| Referencing Type     | Structure                  | Notes                      |
+----------------------+----------------------------+----------------------------+
| Child Referencing    | Parent holds array of      | Good for 1:FEW             |
|                      | ObjectIDs to children      | Bad if too many children   |
+----------------------+----------------------------+----------------------------+
| Parent Referencing   | Child holds ObjectID of    | Best for 1:MANY / 1:TON    |
|                      | parent                     | Efficient for lookups      |
+----------------------+----------------------------+----------------------------+
| Two-Way Referencing  | Both hold references       | Used for MANY:MANY         |
|                      | to each other              | Needs consistency mgmt     |
+----------------------+----------------------------+----------------------------+





  SUMMARY-->

  👉 The most important principle is: Structure your data to match the ways that your application queries and updates data; 
 
  👉In other words: Identify the questions that arise from your application’s use cases first, and then model your data so that 
the questions can get answered in the most efficient way; 

👉 In general, always favor embedding, unless there is a good reason not to embed. Especially on 1:FEW and 1:MANY 
relationships; 

👉 A 1:TON or a MANY:MANY relationship is usually a good reason to reference instead of embedding; 

👉 Also, favor referencing when data is updated a lot and if you need to frequently access a dataset on its own; 

👉Use embedding when data is mostly read but rarely updated, and when two datasets belong intrinsically together; 

👉 Don’t allow arrays to grow indefinitely. Therefore, i(f you need to normalize, use child referencing for 1:MANY 
relationships, and parent referencing for 1:TON relationships; 

👉Use two-way referencing for MANY:MANY relationships

     THE NATURES DATA MODEL-->

  ![](/naturesdatamodel.png)



         * Modelling Location(Geospatial Data)
     
     In tours model ,

     Geospatial data -->is a data which discribe places on earth using log and lati coordinates,simple points or
     geamotry like lines,polygone etc


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
    ]

    locations:[]-->created embeded dataSets





                                      *Modelling Tour Guide:Embedding


         embedding tour guide docx into a tour document
         we are goind to embed user document into tour document

         Idea-->when creating a new tour doc the user will simply add an aray of userId and we will
         then get the corresponding user doc based on these id and then we embed them to our tour;

   Create a new field (guides:Array) which will store ids of the users
   using pre middleware(document middleware we can loop in guide array and find there informatin from user model and store it int guides again so at one place) Embedding

   tourModels.js
   gudies:Array,

   tourSchema.pre('save',async function(next){
      const gudiePromise=this.gudies.map(async id=>await User.findById(id)); //it will return promises of array
      this.guides=await Promise.all(guidePromise);
      next();
   });



                          /*Modelling Tour Guide:Referencing*/


   /*Child Referencing*/

   Idea-> simply create Guide field which will store id of type mongoose.model.ObjectId;
   guide:[
      {
         type:mongoose.SchemaTypes.ObjectId,
         ref:"User"
      }
   ]
    
    Later we can retrive information from ids

    we case use .populate('guides'); to get user data
    or we can use query middleware so in background always it populate

    tourSchema.pre(/^find/,function(next){
      this.populate({
      path:'guides',
      select:'-__v -role'
    })
    next();
  });




          
