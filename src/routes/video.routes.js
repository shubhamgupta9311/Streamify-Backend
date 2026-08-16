import {Router} from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router=Router();
  router.route("/")
.get(getAllVideos)
.post(
    verifyJWT,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
)

router.route("/:videoId")
.get(getVideoById)
.patch(verifyJWT,updateVideo)
.delete(verifyJWT,deleteVideo)

router.route("/:videoId/toggle-publish")
.patch(verifyJWT,togglePublishStatus)





export default router;