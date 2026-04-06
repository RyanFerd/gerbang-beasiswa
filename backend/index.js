import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path"; // Tambahan: Untuk menangani jalur file

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import recommendationRoutes from "./routes/recommendation.route.js";

dotenv.config();

// Koneksi Database
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve(); // Mendapatkan alamat folder utama
const app = express();

app.use(express.json());
app.use(cookieParser());

// --- DAFTAR ROUTES API ---
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/recommendation", recommendationRoutes);

// --- [LOGIKA SERVE FRONTEND UNTUK DEPLOYMENT] ---
// Ini akan mengarahkan Express untuk membaca folder build frontend (dist)
app.use(express.static(path.join(__dirname, "/client/dist")));

// Menangani permintaan rute halaman (selain API) agar diarahkan ke index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Middleware Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Error:", err);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Menjalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});