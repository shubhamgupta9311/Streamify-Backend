import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/Video.model.js";
//import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import jwt from "jsonwebtoken";
import mongoose from "mongoose";




const publishAVideo = asyncHandler(async (req, res) => {
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();

    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    if (!description) {
        throw new ApiError(400, "Description is required");
    }

    //getting video and thumbnail files
    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }
    //upload on cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploadedVideo) {
        throw new ApiError(500, "failed to upload video")
    }
    if (!uploadedThumbnail) {
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    const video = await Video.create({
        title: title.trim(),
        description: description.trim(),
        videoFile:{
            url:uploadedVideo.url,
            publicId:uploadedVideo.public_id
        } ,
        thumbnail: {
                url: uploadedThumbnail.url,
    publicId: uploadedThumbnail.public_id
        },
        owner: req.user?._id,
        duration: uploadedVideo.duration,
    }
    )


    return res
        .status(201)
        .json(new ApiResponse(201, video, "video uploaded succesfully "))


})

const getAllVideos = asyncHandler(async (req, res) => {
    //get the data
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    // Convert page and limit into numbers
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));

     // Validate sortBy
    const allowedSortFields = [
        "createdAt",
        "views",
        "title",
        "duration"
    ];

    const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";

    // Validate sortType
    if (sortType !== "asc" && sortType !== "desc") {
        throw new ApiError(400, "Invalid sort type");
    }
    const matchConditions = {
        isPublished: true
    };

    if (query?.trim()) {
        matchConditions.$or = [
            {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query,
                    $options: "i"
                }
            }
        ];
    }

    if (userId) {
        if(!mongoose.Types.ObjectId.isValid(userId)){
    throw new ApiError(400,"invalid userId")
        }
        matchConditions.owner = new mongoose.Types.ObjectId(userId);
    }

    const aggregate = Video.aggregate([
        //ist stage
        {
            $match: matchConditions
        },

        //iind stage
        {
            $sort: {
                [sortField]: sortType === "asc" ? 1 : -1
            }
        },
        //third stage

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                        }
                    }



                ]



            }

        },

        {
            $addFields: {
                owner: {
                    $first:"$owner"
                }
            }
        },

            //4th stage
            {
            $project: {
                title: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: 1

            }
        },
    ])

    //pagination options
  const options={
    page:pageNumber,
    limit:limitNumber
  }
//pagination aggregation result
  const videos= await Video.aggregatePaginate(
    aggregate,
    options
  )
 

  return res
  .status(200)
  .json(new ApiResponse(200,videos,"videos fetched succesfully"))

})

//authorization left
const getVideoById=asyncHandler(async(req,res)=>{

const{videoId}=req.params;

if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400,"Invalid videoId")
}

// const video=await Video.findById(videoId);
// console.log(video);
 // Increment views
 await Video.findByIdAndUpdate(
    videoId,
    {
$inc:{
    views:1,
}
    }
   
 );

const video= await Video.aggregate([
{
    $match:{
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished:true
    }
},

{
    $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"owner",
        pipeline:[
            {
                $project:{
                    fullname:1,
                    username:1,
                    avatar:1,

                }
            }
        ]
    }
},
  {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },

])


//check if video exist
if(!video.length){
    throw new ApiError(400,"Video not found")
}  


return res
.status(200)
.json(new ApiResponse(
    200,
    video[0],
    "video fetched successfully"
))

})


const updateVideo=asyncHandler(async(req,res)=>{
 
    const {videoId}=req.params;
 const title = req.body.title?.trim();
    const description = req.body.description?.trim();

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid videoId");
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }

 const updateFields={};

 if(title){
    updateFields.title=title;
 }

 if(description){
updateFields.description=description;
 }


 if(Object.keys(updateFields).length==0){
    throw new ApiError(400,"At least one field is required")
 }
   
//authorization later

const updatedVideo=await Video.findByIdAndUpdate(
    videoId,
    {
        $set:updateFields
    },
    {
        new:true
    }
);

return res
.status(200)
.json(
    new ApiResponse(200,updatedVideo,"video updated successfully")
)

})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId} =req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid VideoId")
    }
 const video=await Video.findById(videoId);

 if(!video){
    throw new ApiError(404,"Video not Found")
 }

 if(!video.owner.equals(req.user._id)){
    throw new ApiError(403,"Your are not authorized to delete this video")
 }


 const deletedVideo=await deleteFromCloudinary(video.videoFile.publicId);


 const deletedThumbnail=await deleteFromCloudinary(video.thumbnail.publicId);

if(!deletedVideo ||!deletedThumbnail){
    throw new ApiError(500,"Failed to delete files from cloudinary")
}

await video.deleteOne();

return res
.status(200)
.json(new ApiResponse(200,{},"Video deleted successfully"))




})

const togglePublishStatus=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;

 if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid VideoId")
    }
 const video=await Video.findById(videoId);

 if(!video){
    throw new ApiError(404,"Video not Found")
 }

 if(!video.owner.equals(req.user._id)){
    throw new ApiError(403,"Your are not authorized to  toggle publish status of the video")
 }

video.isPublished=!(video.isPublished);

await video.save({validateBeforeSave:false})

return res
.status(200)
.json(new ApiResponse(200,video,"Publish status updated successfully"))

})

export {
    publishAVideo,
    getAllVideos ,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

}