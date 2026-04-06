import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    // --- DATA AKUN STANDAR ---
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, // [UPDATE] Menghapus spasi tidak sengaja di awal/akhir
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // [UPDATE] Memastikan email tersimpan huruf kecil semua
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
    },
    
    // --- ROLE MANAGEMENT ---
    isAdmin: {
      type: Boolean,
      default: false,
    },
    
    // Role Kontributor / Mitra
    isUserContributor: {
      type: Boolean,
      default: false, 
    },

    // Status Persetujuan Akun
    // Logic: 
    // - User Biasa (Mahasiswa) -> Default TRUE (Langsung aktif)
    // - Mitra (Institusi) -> Diubah jadi FALSE via Controller saat Register (Menunggu Admin)
    isApproved: {
      type: Boolean,
      default: true, 
    },

    // --- DATA PROFIL MITRA (KHUSUS KONTRIBUTOR) ---
    organizationName: {
        type: String,
        default: "",
        trim: true,
    },
    // [BARU] Website Institusi (Sesuai Controller)
    website: {
        type: String,
        default: "",
        trim: true,
    },

    // --- 5 ATRIBUT KHUSUS SKRIPSI (DATA REKOMENDASI MAHASISWA) ---
    educationLevel: { type: String, default: "Umum" },
    major: { type: String, default: "" },
    gpa: { type: Number, default: 0 },
    location: { type: String, default: "" },
    income: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User