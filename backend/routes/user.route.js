import express from "express"
import {
  updateUser,
  deleteUser,
  getUsers,
  getUser,
  toggleUserContributor,
  getPartners,
  approvePartner,
  rejectPartner,
  getNotifications, 
  markNotificationAsRead 
} from "../controller/user.controller.js"
// --- [PENTING] Import signout dari auth controller ---
import { signout } from "../controller/auth.controller.js" 
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

// --- 1. AUTH & UMUM ---
// Sekarang menggunakan signout yang kita buat di auth.controller.js
router.post("/signout", signout)

// --- 2. DASHBOARD ADMIN (USERS) ---
router.get("/getusers", verifyToken, getUsers)
router.put("/toggle-contributor/:userId", verifyToken, toggleUserContributor)

// --- 3. DASHBOARD ADMIN (MITRA / PARTNERS) ---
router.get("/partners", verifyToken, getPartners) 
router.put("/approve/:userId", verifyToken, approvePartner)
router.delete("/reject/:userId", verifyToken, rejectPartner)

// --- 4. NOTIFIKASI ---
router.get("/notifications", verifyToken, getNotifications)
router.put("/notifications/:notificationId/read", verifyToken, markNotificationAsRead)

// --- 5. MANAJEMEN AKUN SENDIRI (User) ---
router.put("/update/:userId", verifyToken, updateUser)
router.delete("/delete/:userId", verifyToken, deleteUser)

// --- 6. PUBLIC PROFILE ---
router.get("/:userId", getUser)

export default router