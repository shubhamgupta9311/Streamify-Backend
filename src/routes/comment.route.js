import{Router} from "express"
const router=Router()
import { addComment,deleteComment,getVideoComments,updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";



router.route("/:videoId").post(verifyJWT,addComment);
router.route("/:commentId").delete(verifyJWT,deleteComment)
router.route("/:videoId").get(getVideoComments)
router.route("/:commentId").patch(verifyJWT,updateComment)
export default router