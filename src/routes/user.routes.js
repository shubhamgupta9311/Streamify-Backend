import {Router} from "express";
import { loginUser, 
    logoutUser, 
    registerUser ,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountdetails,
    updateCoverImage,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory }
     from "../controllers/user.controllers.js";

import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validateRegister } from "../middleware/validate.middleware.js";

const router=Router();

//user register route

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        }, //should match with fronted
        {
            name:"coverImage",
             maxCount:1
        }
    ]),validateRegister,
    registerUser);

    //login route
    router.route("/login").post(loginUser)

    //secured routes
      router.route("/logout").post(verifyJWT,logoutUser)
     router.route("/refresh-token").post(refreshAccessToken)

     router.route("/change-password").post(verifyJWT,changeCurrentPassword)
     router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("update-account").patch(verifyJWT,updateAccountdetails )

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage )

router.route("/c/:username").get(verifyJWT,getUserChannelProfile )

router.route("/history").get(verifyJWT, getWatchHistory)
// export{
//     router
// }
export default router