import { toggleSubscription } from "../controllers/subscription.controller.js";
import{Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
const router=Router()

router.route("/:channelId").post(verifyJWT,toggleSubscription)

export default router
