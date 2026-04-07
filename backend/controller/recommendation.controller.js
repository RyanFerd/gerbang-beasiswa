import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

export const suggestPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // 1. Ambil Data User
    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, "User tidak ditemukan"));

    // Ambil nilai profil ke variabel lokal
    const userGPA = user.gpa;
    const userIncome = user.familyIncome || user.income; 
    const userEdu = user.educationLevel || ""; // Misal: "S2"

    // Validasi data profil minimal
    if (!userGPA || userIncome === undefined || !userEdu) {
      return next(errorHandler(400, "Harap lengkapi Jenjang Pendidikan, IPK, dan Penghasilan di Profil agar Rekomendasi Cerdas bekerja!"));
    }

    // 2. Query Dasar (Hanya ambil yang sudah approved)
    let query = { status: 'approved' };
    
    if (req.query.searchTerm) {
        query.$or = [
            { title: { $regex: req.query.searchTerm, $options: 'i' } },
            { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ];
    }
    if (req.query.category && req.query.category !== 'uncategorized') {
        query.category = req.query.category;
    }

    // 3. Ambil data dari Database
    const allPosts = await Post.find(query);

    // 4. ALGORITMA EUCLIDEAN DISTANCE (VERSI UPDATE)
    const scoredPosts = allPosts.map((post) => {
      let distanceSquared = 0;

      // --- A. Jenjang Pendidikan (Penalty: 1.0) ---
      // Post.criteriaEducationLevel sekarang adalah ARRAY, misal: ["S1", "S2"] atau ["all"]
      const reqEduArray = post.criteriaEducationLevel || ["all"];
      
      // Jika beasiswa tidak untuk "all" DAN jenjang user tidak ada di dalam daftar beasiswa
      if (!reqEduArray.includes("all") && !reqEduArray.includes(userEdu)) {
          // Penalti berat jika jenjang tidak masuk kriteria
          distanceSquared += Math.pow(1.5, 2); 
      }

      // --- B. Jurusan (Penalty: 0.5) ---
      const userMajor = user.major || "";
      const reqMajor = post.criteriaMajor || "";
      if (reqMajor && reqMajor.toLowerCase() !== "semua jurusan") {
          if (!userMajor.toLowerCase().includes(reqMajor.toLowerCase())) {
              distanceSquared += Math.pow(0.5, 2); 
          }
      }

      // --- C. IPK (Numeric) ---
      const valUserGPA = parseFloat(userGPA) || 0;
      const reqGPA = parseFloat(post.criteriaMinGPA) || 0;
      
      if (reqGPA > 0) {
          const normUserGPA = valUserGPA / 4.0;
          const normReqGPA = reqGPA / 4.0;
          
          if (valUserGPA < reqGPA) {
             const diff = normReqGPA - normUserGPA;
             distanceSquared += Math.pow(diff + 0.8, 2); // Penalty 0.8 jika tidak memenuhi syarat IPK
          } 
      }

      // --- D. Lokasi (Penalty: 0.3) ---
      const userLoc = user.location || "";
      const reqLoc = post.criteriaLocation || "";
      if (reqLoc && reqLoc.toLowerCase() !== "nasional") {
          if (!userLoc.toLowerCase().includes(reqLoc.toLowerCase())) {
              distanceSquared += Math.pow(0.3, 2); 
          }
      }

      // --- E. Ekonomi (Numeric) ---
      const valUserIncome = parseFloat(userIncome) || 0;
      const maxIncome = parseFloat(post.criteriaMaxIncome) || 0;
      
      if (maxIncome > 0) {
          const normUserIncome = Math.min(valUserIncome, 15000000) / 15000000;
          const normMaxIncome = Math.min(maxIncome, 15000000) / 15000000;

          if (valUserIncome > maxIncome) {
              const diffIncome = normUserIncome - normMaxIncome;
              distanceSquared += Math.pow(diffIncome * 2.0, 2); // Ekonomi punya bobot tinggi
          }
      }

      const finalDistance = Math.sqrt(distanceSquared);
      return { ...post._doc, distance: finalDistance };
    });

    // 5. SORTING & PAGINATION
    scoredPosts.sort((a, b) => a.distance - b.distance);

    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const paginatedPosts = scoredPosts.slice(startIndex, startIndex + limit);

    res.status(200).json({ 
        posts: paginatedPosts, 
        totalPosts: allPosts.length 
    });

  } catch (error) {
    console.error("Error Recommendation:", error);
    next(error);
  }
};