import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/Video.model.js";


const addComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const content = req.body.content?.trim();

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId")
    }

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "video not found")
    }

    const comment = await Comment.create({

        content,
        video: videoId,
        owner: req.user._id

    })

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "comment added succesfully"))

})


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid comment id")
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })


    if (!comment) {
        throw new ApiError(404, "Comment not found or you are not authorized to delete it")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted Successfully"))

})

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid videoId")
    }

    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }

    const comment=await Comment.find({video:videoId})

    return res
    .status(200)
    .json(new ApiResponse(200,comment,"comment fetched successfully"))

})

const updateComment=asyncHandler(async(req,res)=>{
     const { commentId } = req.params

if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid comment id")
    }

    const newContent=req.body.content?.trim();

    if(!newContent){
throw new ApiError(400,"content is required")
    }

    const updatedComment=await Comment.findOneAndUpdate(
        {
            _id:commentId,
            owner:req.user._id
        },
        {
 $set: {
      content:newContent
        }
        },
     
        {
            new:true
        }
    )
 if(!updatedComment){
    throw new ApiError(404," comment not found or you are not authorized to update the comment")
 }

 return res
 .status(200)
 .json(new ApiResponse(200,updatedComment,"comment updated successfully"))
})



export {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
}