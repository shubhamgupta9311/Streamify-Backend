import { Router } from "express"
const router=Router()
import { toggleVideoLike ,toggleCommentLike,toggleTweetLike} from "../controllers/like.controller.js"
import { verifyJWT} from "../middleware/auth.middleware.js"



router.route("/video/:videoId").post(verifyJWT,toggleVideoLike)
router.route("/comment/:commentId").post(verifyJWT,toggleCommentLike)
router.route("/tweet/:tweetId").post(verifyJWT,toggleCommentLike)

export default router;