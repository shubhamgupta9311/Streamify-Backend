import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";


const  toggleSubscription=asyncHandler(async(req ,res)=>{
    const{channelId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
}

    const channel=await User.findById(channelId)
    if(!channel){
        throw new ApiError(404,"channel not found")
    }

    const existingSubscriber=await Subscription.findOne({
     subscriber:req.user._id,
     channel:channelId
    })

    if(existingSubscriber){
        await Subscription.deleteOne({
            subscriber:req.user._id,
     channel:channelId
        })

        return res
        .status(200)
        .json( new ApiResponse(200,{},"Unsubscribed Successfully"))
    }
    else{
        await  Subscription.create({
         subscriber:req.user._id,
     channel:channelId
        })
         return res
        .status(200)
        .json(new ApiResponse(200,{},"Subscribed Successfully"))
    }

})


export{
    toggleSubscription
 }