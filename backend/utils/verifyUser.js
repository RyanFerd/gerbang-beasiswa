import { errorHandler } from "./error.js"
import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    // Jika tidak ada token sama sekali
    return next(errorHandler(401, "Sesi Anda telah berakhir, silakan login kembali."));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Jika token expired (lebih dari 1 hari) atau dimanipulasi
      const message = err.name === 'TokenExpiredError' 
        ? "Sesi login Anda sudah habis (1 hari), silakan masuk kembali." 
        : "Akses tidak valid.";
      
      return next(errorHandler(401, message));
    }

    // Menyimpan data user (id, isAdmin, isUserContributor) ke dalam request
    req.user = user;
    next();
  });
}