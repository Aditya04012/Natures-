const dotenv=require("dotenv");

const mongoose=require("mongoose");
const fs=require("fs");
 
const Tour=require('./../../models/tourModel');


dotenv.config({ path: './config.env' });

//console.log('Database Local URI:', process.env.DATABASE_LOCAL); // Add this line
const DB = process.env.DATABASE_LOCAL;
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology:true
}).then(()=>{
  console.log("DB connected");
});




const data = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
const newdata=JSON.parse(data);
const importData= async()=>{
    try{
      await  Tour.create(newdata);
        console.log("sucessful");
    }catch(err){
        console.log(err);
    }
process.exit();
}

const deleteData=async()=>{
   
    try{
        await Tour.deleteMany();
        console.log("deleted sucessful");

    }catch(err){
        console.log(err);
    }
    process.exit();
}



if (process.argv.includes('--import')) {
    importData();
  } else if (process.argv.includes('--delete')) {
    deleteData();
  }
