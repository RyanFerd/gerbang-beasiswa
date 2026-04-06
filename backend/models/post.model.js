import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    // --- DATA STANDAR POSTINGAN ---
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      default: "uncategorized",
    },
    image: {
      type: String,
      default:
        "https://images.pexels.com/photos/723072/pexels-photo-723072.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    
    // --- LINK PENDAFTARAN (BARU) ---
    officialLink: {
      type: String,
      default: "", // Default kosong agar tidak error jika tidak diisi
    },

    // --- 5 KRITERIA BEASISWA (UNTUK ALGORITMA) ---
    
    // 1. Target Jenjang
    criteriaEducationLevel: {
      type: [String], // Array of strings
      default: ["Umum"], 
    },

    // 2. Target Jurusan
    criteriaMajor: {
      type: String,
      default: "",
    },

    // 3. Syarat Minimal IPK
    criteriaMinGPA: {
      type: Number,
      default: 0,
    },

    // 4. Target Lokasi
    criteriaLocation: {
      type: String,
      default: "",
    },

    // 5. Maksimal Penghasilan Ortu
    criteriaMaxIncome: {
      type: Number,
      default: 0, 
    },

    // --- PENGATURAN WAKTU ---
    
    // Tanggal Dibuka (Start Date)
    startDate: {
        type: Date,
        default: Date.now, // Default hari ini jika kosong
    },

    // Tanggal Ditutup (Deadline)
    deadline: {
      type: Date,
      default: null, // Boleh kosong/null (selamanya)
    },

    // --- STATUS POSTINGAN ---
    status: {
      type: String,
      default: 'pending', 
      enum: ['pending', 'approved', 'rejected'], 
    },
  },
  { timestamps: true }
)

const Post = mongoose.model("Post", postSchema)

export default Post