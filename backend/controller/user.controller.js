import User from "../models/user.model.js";
import Notification from "../models/notification.model.js"; // [BARU]
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import { createNotification } from "../utils/createNotification.js"; // [BARU] Helper kita

// --- 1. UPDATE USER ---
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You can only update your own account!"));
  }
  if (req.body.password) {
    if (req.body.password.length < 8) {
      return next(errorHandler(400, "Password must be atleast 8 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 5 || req.body.username.length > 20) {
      return next(errorHandler(400, "Username must be between 5 and 20 characters"));
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      req.body.username = req.body.username.toLowerCase();
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(errorHandler(400, "Username can only contain letters and numbers"));
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
          educationLevel: req.body.educationLevel,
          major: req.body.major,
          gpa: req.body.gpa,
          location: req.body.location,
          income: req.body.income,
        },
      },
      { new: true }
    );
    const { password: pass, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// --- 2. TOGGLE KONTRIBUTOR ---
export const toggleUserContributor = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Hanya Admin yang boleh mengubah role!"));
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(errorHandler(404, "User tidak ditemukan"));

    user.isUserContributor = !user.isUserContributor;
    await user.save();

    // [NOTIFIKASI] Jika user diaktifkan sebagai kontributor
    if (user.isUserContributor) {
      await createNotification(
        user._id,
        req.user.id,
        "Selamat! Anda telah diberikan akses sebagai Kontributor. Anda sekarang dapat mulai mengajukan artikel beasiswa.",
        "ADMIN_INFO"
      );
    }

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// --- 3. DELETE USER ---
export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You can only delete your own account!"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};

// --- 4. SIGN OUT ---
export const signout = async (req, res, next) => {
  try {
    res.clearCookie("access_token").status(200).json("User has been logged out successfully!");
  } catch (error) {
    next(error);
  }
};

// --- 5. GET USERS ---
export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Unauthorized!"));
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find().sort({ createdAt: sortDirection }).skip(startIndex).limit(limit);
    const getUsersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
    const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    res.status(200).json({ users: getUsersWithoutPassword, totalUsers, lastMonthUsers });
  } catch (error) {
    next(error);
  }
};

// --- 6. GET USER ---
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(errorHandler(404, "User not found!"));
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// ==========================================
//          TAMBAHAN FUNGSI MITRA
// ==========================================

// --- 7. AMBIL SEMUA DATA MITRA ---
export const getPartners = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Akses ditolak."));
  try {
    const partners = await User.find({ isUserContributor: true }).sort({ createdAt: -1 });
    const partnersWithoutPassword = partners.map((p) => {
      const { password, ...rest } = p._doc;
      return rest;
    });
    res.status(200).json(partnersWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// --- 8. SETUJUI MITRA (APPROVE) ---
export const approvePartner = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Hanya Admin yang boleh menyetujui."));
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { isApproved: true } },
      { new: true }
    );

    // [NOTIFIKASI] Kirim ke Mitra bahwa pendaftaran disetujui
    await createNotification(
      updatedUser._id,
      req.user.id,
      "Pendaftaran akun Mitra Anda telah disetujui oleh Admin. Selamat bekerja!",
      "PARTNER_VERIFICATION"
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// --- 9. TOLAK MITRA ---
export const rejectPartner = async (req, res, next) => {
  if (!req.user.isAdmin) return next(errorHandler(403, "Hanya Admin yang boleh menolak."));
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User mitra telah ditolak dan dihapus.");
  } catch (error) {
    next(error);
  }
};

// ==========================================
//       [BARU] FUNGSI NOTIFIKASI
// ==========================================

// --- 10. AMBIL NOTIFIKASI USER ---
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(15);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// --- 11. TANDAI SUDAH DIBACA ---
export const markNotificationAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notificationId, { isRead: true });
    res.status(200).json("Notification marked as read");
  } catch (error) {
    next(error);
  }
};