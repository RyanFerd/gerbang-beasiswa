import express from "express"
import { verifyToken } from "../utils/verifyUser.js"
import { 
    create, 
    deletepost, 
    getPosts, 
    updatepost,
    approvePost 
} from "../controller/post.controller.js" // <-- Cek nama folder (controllers vs controller)

const router = express.Router()

router.post("/create", verifyToken, create)
router.get("/getposts", getPosts) // getPosts tidak butuh verifyToken agar publik bisa baca
router.delete("/deletepost/:postId/:userId", verifyToken, deletepost)
router.put("/updatepost/:postId/:userId", verifyToken, updatepost)
router.put("/approve-post/:postId/:userId", verifyToken, approvePost)

export default router