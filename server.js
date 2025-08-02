const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path: './config.env'}); 
const app=require("./app");
const DB=process.env.DATABASE_LOCAL;
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology:true
}).then(()=>{
  console.log("DB connected");
});





app.listen(3000, () => {
    console.log("server is live at port 3000");
  });

  process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log("UNHANDLER REJECTION! 🧨 Shuting down...");
      process.exit(1);
  })

  process.on('uncaughtException',err=>{
    console.log(err.name,err.message);
    console.log("UNCAUGHT EXEPTION ! 🧨 Shuting down...");
      process.exit(1);
  });