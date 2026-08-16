import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//8.
const generateAccessTokenAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        //till now we created token only and this token is in this method not go outside till yet

        //9.saving refresh token in db
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        //10.return tokens in object
        return { accessToken, refreshToken };


    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")

    }

}



//writing a method
const registerUser = asyncHandler(async (req, res) => {

    //  res.status(200).json({
    //     message:"ok"
    // })
    //1. getting detals from fronted
    const { fullname, email, username, password } = req.body
    //2.validation
    // if(fullname===""){
    //     throw new ApiError(400,"full name is required")
    // }
    // if(email===""){
    //     throw new ApiError(400,"email is required")
    // }
    // if(username===""){
    //     throw new ApiError(400,"username is required")
    // }
    // if(password===""){
    //     throw new ApiError(400,"password  is required")
    // }

    //production method

    if (
        [fullname, email, username, password].some((field) =>
            !field?.trim())
    ) {
        throw new ApiError(400, "All fields are required")
    }




    //3.//user already exit check
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //4.deal with images/files thorugh multer
    console.log(req.files?.avatar?.[0]?.path)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;




    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    //5.upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "failed to upload avatar")
    }


    //6.entry into db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url,
        email,
        password,
        username: username.toLowerCase()
    })

    //7.checking user created or not  with removign the password and refresh token fields if cretaed it will 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    //8.sending the response
   return  res.status(200).json(
        new ApiResponse(200, createdUser, "User register successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    //req body-data
    //username or email bases login or both means from any one it can be login
    ////find the user
    //check the password
    //generate acces and refreh token
    //send this token in form of cokkie
    // //1.

    const { username, email, password } = req.body;
    //2.
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }
    //3.
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    //4.
    if (!user) {
        throw new ApiError(404, "user not found");
    }
    //5.password check
    if (!password) {
        throw new ApiError(400, "password is required")
    }
    //6.now matching password now we will apply a method .ispassword corrrect on user not on USER b/c USER of of mongodb and user have currely going on user information
    //brcypt mai bhi await krnn pdega
    const isPaswordValid = await user.isPasswordCorrect(password)  ///gives true or false

    //7.matching password
    if (!isPaswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }


    //11.taking out tokens from the method
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    //12. another query for ckean response b/c old user contains all details like password and refreshtoken but we dont send it to fronted
    const loggedInUser = await User.findById(user._id)

    //13.now setting up options for cookies
    const option = {
        httpOnly: true,
        secure: true
    }

    //14. return  the resonse ad cookie
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in Successfully"

            )


        )



})


const logoutUser = asyncHandler(async (req, res) => {
    //taking out that user as now we have info about that user and update is ts rfreshToken to undefined


    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1  //this removes the field from the document

            }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logout succesfully"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    console.log(req.cookies);
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})



//change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    //1.getting form data
    const { oldPassword, newPassword, confirmPassword } = req.body;

    //checking form
    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required")
    }
    if (newPassword != confirmPassword) {
        throw new ApiError(400, "confirm and new password must be same");
    }

    //2.getting user
    const user = await User.findById(req.user?._id);
    //3.checking old pasword

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    //4.updating password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })


    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password change Succesfully")
        )
})


//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "User Fetched Successfully")
        )
})


//updateAccoutdetails
const updateAccountdetails = asyncHandler(async (req, res) => {

    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        )
})

//update avatarimage

const updateUserAvatar = asyncHandler(async (req, res) => {
    //req.file blc in route we are uplaoding single file like upload.single()
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "error while uploading the avatar")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")


    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
})
//update cover image
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    //TODO:delete old image
    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image file is missing")
    }


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "error while uploading the cover image")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")


    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover image updated successfully")
        )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {


    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        //how many subscriber we have
        {

            $lookup: {
                from: "subcriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }

        },
        //how many channel we subscribed to
        {
            $lookup: {
                from: "subcriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }

        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                SubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                req.user._id, "$subscribers.subscriber"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }

        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberCount:1,
                SubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1

            }
        }
    ])

    if(!channel.length){
        throw new ApiError(404,"channel does not exist")
    }

return res
.status(200)
.json(
    new ApiResponse(200,channel[0],"User channel fetched succesfully")
)
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
{
    $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
    }
},
{
    $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"owner",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            },
            //this will overwrite above owner
            $addFields:{
                 owner:{
                    $first:"$owner"
                 }
            }
        }]


    }
}








    ])


    return res
    .status(200)
    .json(
    
        new ApiResponse(200,user[0].watchHistory,"Watch history fetched succesfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountdetails,
    updateCoverImage,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory
}
//now we go to create route as method will run when user hit any url
