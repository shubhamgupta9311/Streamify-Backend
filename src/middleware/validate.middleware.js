import validator from "validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";


const validateRegister=asyncHandler(async(req,res,next)=>{
const{email,password}=req.body;

if(!validator.isEmail(email)){
    throw new ApiError(400,"invalid email format");
}

if(!validator.isStrongPassword(password)){
      throw new ApiError(400,"password must be strong");
}

next();


})



export {
   validateRegister
}