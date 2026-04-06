import express from "express"
import {
  updateUser,
  deleteUser,
  signout,
  getUsers,
  getUser,
  toggleUserContributor,
  getPartners,
  approvePartner,
  rejectPartner,
  // [BARU] Tambahkan ini nanti di controller
  getNotifications, 
  markNotificationAsRead 
} from "../controller/user.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

// --- 1. AUTH & UMUM ---
router.post("/signout", signout)

// --- 2. DASHBOARD ADMIN (USERS) ---
router.get("/getusers", verifyToken, getUsers)
router.put("/toggle-contributor/:userId", verifyToken, toggleUserContributor)

// --- 3. DASHBOARD ADMIN (MITRA / PARTNERS) ---
router.get("/partners", verifyToken, getPartners) 
router.put("/approve/:userId", verifyToken, approvePartner)
router.delete("/reject/:userId", verifyToken, rejectPartner)

// --- 4. NOTIFIKASI [BARU] ---
// Route untuk mengambil notifikasi milik user yang sedang login
router.get("/notifications", verifyToken, getNotifications)
// Route untuk menandai notifikasi sudah dibaca
router.put("/notifications/:notificationId/read", verifyToken, markNotificationAsRead)

// --- 5. MANAJEMEN AKUN SENDIRI (User) ---
router.put("/update/:userId", verifyToken, updateUser)
router.delete("/delete/:userId", verifyToken, deleteUser)

// --- 6. PUBLIC PROFILE (WILDCARD) ---
router.get("/:userId", getUser)

export default router