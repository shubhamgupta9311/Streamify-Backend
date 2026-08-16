import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/Video.model.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "name is required")
    }

    if (!description?.trim()) {
        throw new ApiError(400, "description is required")
    }


    const playlist = await Playlist.create(
        {
            name,
            description,
            owner: req.user._id
        }
    )

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "playlist created successfully"))



})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid UserId")
    }

    const playlist = await Playlist.find({ owner: userId })

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "playlist fetched successfully"))


})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "invalid Playlist id")
    }

    const name = req.body.name?.trim();
    const description = req.body.description?.trim();


    const updateFields = {}

    if (name) {
        updateFields.name = name;
    }

    if (description) {
        updateFields.description = description;
    }

    if (Object.keys(updateFields).length == 0) {
        throw new ApiError(400, "atleast one field is required to update")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id

        },
        {
            $set: updateFields

        },

        {
            new: true
        }
    )


    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "playlist update successfully"))




})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "invalid Playlist id")
    }


    const deletedPlayist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            owner: req.user._id
        }
    )

    if (!deletedPlayist) {
        throw new ApiError(404, "playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "playlist deleted Succesfully"))

})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "playlistId is invalid")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "videoId is invalid")
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user._id
    })

    if (!playlist) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const videoExists = playlist.videos.some(
        (id) => id.equals(videoId)
    )

    if (videoExists) {
        throw new ApiError(400, "Video already exists in playlist");
    }


    playlist.videos.push(videoId)
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "video added succesfully"))



})


const RemoveVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "playlistId is invalid")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "videoId is invalid")
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user._id
    })

    if (!playlist) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }

    const videoExists = playlist.videos.some(
        (id) => id.equals(videoId)
    )

    if (!videoExists) {
        throw new ApiError(400, "Video does not exist in playlist");
    }

    playlist.videos.pull(videoId)
    await playlist.save()


    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video removed succesfully"))


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "playlistId is invalid")
    }



    const playlist = await Playlist.aggregate([

{
    $match:{
        _id: new mongoose.Types.ObjectId(playlistId)
    }
},
{
    $lookup:{
           from:"videos",
           localField:"videos",
              foreignField:"_id",
              as:"videos"
    }
}


    ]
    )

    if(playlist.length==0){
        throw new ApiError(404,"playlist not found")
    }

return res
.status(200)
.json(new ApiResponse(200,playlist[0],"playlist fetched successfully"))    
})


export {
    createPlaylist,
    getUserPlaylists,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    RemoveVideoFromPlaylist,
    getPlaylistById

}