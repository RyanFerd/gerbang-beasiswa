import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { createNotification } from "../utils/createNotification.js"; // [BARU] Import helper notif

// --- SIGN UP (DAFTAR) ---
export const signup = async (req, res, next) => {
  // 1. Tangkap semua data dari body, termasuk 'website'
  const { username, email, password, isUserContributor, organizationName, website } = req.body;

  // 2. Validasi Dasar (Username, Email, Password Wajib)
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "Semua kolom wajib diisi."));
  }

  // 3. Validasi Khusus Mitra
  if (isUserContributor === true && (!organizationName || organizationName.trim() === "")) {
    return next(errorHandler(400, "Nama Organisasi wajib diisi untuk pendaftaran Mitra."));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  // 4. LOGIKA APPROVAL
  const approvalStatus = isUserContributor === true ? false : true;

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    isUserContributor: isUserContributor || false,
    organizationName: organizationName || "",
    website: website || "",
    isApproved: approvalStatus, 
  });

  try {
    const savedUser = await newUser.save(); // [UPDATE] simpan ke variabel untuk ambil ID

    // --- [BARU] LOGIKA NOTIFIKASI KE ADMIN ---
    if (isUserContributor) {
      // Cari semua admin di database
      const admins = await User.find({ isAdmin: true });
      
      // Kirim notif ke setiap admin
      const notificationPromises = admins.map((admin) =>
        createNotification(
          admin._id, // Penerima
          savedUser._id, // Pengirim (Mitra baru)
          `Ada pendaftaran Mitra baru: "${organizationName}". Segera cek dan verifikasi akunnya.`,
          "PARTNER_VERIFICATION"
        )
      );
      await Promise.all(notificationPromises);
    }
    // ------------------------------------------

    // 5. Response ke Frontend
    if (isUserContributor) {
        res.status(201).json({ 
            success: true, 
            message: "Pendaftaran Instansi berhasil! Menunggu verifikasi Admin." 
        });
    } else {
        res.status(201).json({ 
            success: true, 
            message: "Pendaftaran berhasil!" 
        });
    }
    
  } catch (error) {
    next(error);
  }
};

// --- SIGN IN (MASUK) --- (Sesuai kode Anda, tidak ada yang dikurangi)
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "Semua kolom wajib diisi."));
  }

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, "User tidak ditemukan."));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(400, "Password salah."));
    }

    if (validUser.isUserContributor === true && validUser.isApproved === false) {
        return next(errorHandler(403, "Akun Institusi Anda sedang dalam peninjauan Admin. Mohon tunggu 1x24 jam."));
    }

    const token = jwt.sign(
      { 
          id: validUser._id, 
          isAdmin: validUser.isAdmin,
          isUserContributor: validUser.isUserContributor 
      },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// --- GOOGLE AUTH --- (Sesuai kode Anda, tidak ada yang dikurangi)
export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, isUserContributor: user.isUserContributor },
        process.env.JWT_SECRET
      );
      const { password: pass, ...rest } = user._doc;
      
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
        isUserContributor: false,
        isApproved: true,
      });

      await newUser.save();
      
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin, isUserContributor: false },
        process.env.JWT_SECRET
      );
      
      const { password: pass, ...rest } = newUser._doc;
      
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};