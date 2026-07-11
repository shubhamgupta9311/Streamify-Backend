import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";



const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import router
// import {router} from "./routes/user.routes.js";

// app.use("/api/v1//user",router);
//OR A GOOD PRACTICE,HERE WE USE DEAFULT EXPORT SO THAT WE CAN NAME IT ANY LIKE USERROUTER FOR MEAN UNDERSTANDING CODE 
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user",userRouter);

export{
    app
}