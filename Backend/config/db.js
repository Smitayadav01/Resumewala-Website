import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()

const connectDB = async () => {
    try{
       await mongoose.connect(process.env.MONGO_URI,{dbName:"ResumeWala"})
       console.log("Connected to DB")
    }catch(e){
        console.error("Error connecting to database");
        process.exit(1);
    }
}

export default connectDB;