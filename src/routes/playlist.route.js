import {Router} from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
const router=Router()
import{
        createPlaylist,
    getUserPlaylists,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    RemoveVideoFromPlaylist,
    getPlaylistById
} 
from "../controllers/playlist.controller.js"

router.route("/")
    .post(verifyJWT, createPlaylist);

router.route("/user/:userId")
    .get(getUserPlaylists);

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(verifyJWT, updatePlaylist)
    .delete(verifyJWT, deletePlaylist);

router.route("/:playlistId/video/:videoId")
    .post(verifyJWT, addVideoToPlaylist)
    .delete(verifyJWT, RemoveVideoFromPlaylist);




export default router