import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import{Comment} from "../models/comment.model.js"
import{Video} from "../models/Video.model.js"
import{Tweet} from "../models/tweet.model.js"
import mongoose from "mongoose";




const toggleVideoLike=asyncHandler(async(req,res)=>{
 const {videoId}=req.params;

 if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400,"Invalid videoId")
 }

 const video=await Video.findById(videoId)
 if(!video){
    throw new ApiError(404,"Video not found")
 }

 const existingLike=await Like.findOne({
likedBy:req.user._id,
video:videoId
 })

 if(existingLike){
    await Like.deleteOne({
        likedBy:req.user._id,
        video:videoId
    })
        
return res
.status(200)
.json(new ApiResponse(200,{},"Video unliked Successfully"))
 }
else{
    await Like.create({
        likedBy:req.user._id,
        video:videoId
    })
    
return res
.status(200)
.json(new ApiResponse(200,{},"Video Liked Successfully"))
}
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
const {commentId}=req.params

 if(!mongoose.Types.ObjectId.isValid(commentId)){
    throw new ApiError(400,"Invalid commentId")
 }

 const comment=await Comment.findById(commentId)
 if(!comment){
    throw new ApiError(404,"comment not found")
 }

 const existingLike=await Like.findOne({
likedBy:req.user._id,
comment:commentId
 })

 if(existingLike){
    await Like.deleteOne({
        likedBy:req.user._id,
        comment:commentId
    })
        
return res
.status(200)
.json(new ApiResponse(200,{},"Comment unliked Successfully"))
 }
else{
    await Like.create({
        likedBy:req.user._id,
        comment:commentId
    })
    
return res
.status(200)
.json(new ApiResponse(200,{},"Comment Liked Successfully"))
}
})



const toggleTweetLike=asyncHandler(async(req,res)=>{
const {tweetId}=req.params

 if(!mongoose.Types.ObjectId.isValid(tweetId)){
    throw new ApiError(400,"Invalid tweetId")
 }

 const tweet=await Tweet.findById(tweetId)
 if(!tweet){
    throw new ApiError(404,"tweet not found")
 }

 const existingLike=await Like.findOne({
likedBy:req.user._id,
tweet:tweetId
 })

 if(existingLike){
    await Like.deleteOne({
        likedBy:req.user._id,
        tweet:tweetId
    })
        
return res
.status(200)
.json(new ApiResponse(200,{},"Tweet unliked Successfully"))
 }
else{
    await Like.create({
        likedBy:req.user._id,
        tweet:tweetId
    })
    
return res
.status(200)
.json(new ApiResponse(200,{},"tweet Liked Successfully"))
}
})


const getLikedVideos=asyncHandler(async(req,res)=>{


    const LikedVideos=await Like.aggregate([
{
    $match:{
        likedBy:req.user._id
    }
},
{
$lookup:{
    from:"videos",
    localField:"video",
    foreignField:"_id",
    as:"videoDetails"
}
},
{
\ 
}









    ])
})


export{
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    
}