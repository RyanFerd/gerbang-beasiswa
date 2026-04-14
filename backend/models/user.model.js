import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    // --- DATA AKUN STANDAR ---
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
    isUserContributor: {
      type: Boolean,
      default: false, 
    },
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
    website: {
        type: String,
        default: "",
        trim: true,
    },

    // --- DATA PENUNJANG BEASISWA (KHUSUS USER STANDAR) ---
    educationLevel: { 
      type: String, 
      default: "", // Diubah defaultnya agar sinkron dengan form frontend yang kosong di awal
      // Enum disesuaikan dengan value di frontend (DashboardProfile.jsx)
      enum: ['TK', 'SD', 'SMP', 'SMA', 'D3', 'Diploma', 'S1', 'S2', 'S3', 'all', ''] 
    },
    major: { type: String, default: "" },
    gpa: { type: Number, default: 0 },
    location: { type: String, default: "" },
    income: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User