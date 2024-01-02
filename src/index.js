// require("dotenv").config({path:'/.env'})
import dotenv from "dotenv";
import connectDB  from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB();

/*
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        app.on("Error",()=>{
            console.log("Error:",error);
            throw error
        });
        app.listen(process.env.PORT,()=>{
            console.log(`Application listening on PORT:${process.env.PORT}`)
        });
    }catch(error){
        console.error("ERROR,: ",error);
        throw error;
    }
})()
*/