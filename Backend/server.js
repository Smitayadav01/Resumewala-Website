import express from "express";
import connectDB from "./config/db.js";
import userRouter from './routes/userRouter.js'

const app = express();

app.use(express.json());
connectDB()

app.get('/',(req,res)=>{
    return res.send("Hellow woerld")
})

app.use("/api/auth", userRouter);

app.listen(5000, () => console.log("Server running on 5000"));
