import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

export const suggestPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // 1. Ambil Data User
    const user = await User.findById(userId);
    if (!user) return next(errorHandler(404, "User not found"));

    // --- PERBAIKAN UTAMA DISINI ---
    // Kita tampung nilai profile ke variabel lokal
    // Jika user.familyIncome kosong, kita ambil user.income
    const userGPA = user.gpa;
    const userIncome = user.familyIncome || user.income; 

    // Cek apakah data penting ada isinya
    // Kita gunakan (!userGPA) untuk cek null/undefined
    // Kita tidak gunakan (!userIncome) mentah karena kalau gaji 0 rupiah itu valid, tapi kalau undefined/null baru error.
    if (!userGPA || userIncome === undefined || userIncome === null) {
      return next(errorHandler(400, "Harap lengkapi IPK dan Penghasilan Orang Tua di menu Profil agar fitur rekomendasi bekerja!"));
    }

    // 2. Query Dasar (Filter Search & Category standar)
    let query = {};
    if (req.query.searchTerm) {
        query.$or = [
            { title: { $regex: req.query.searchTerm, $options: 'i' } },
            { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ];
    }
    if (req.query.category && req.query.category !== 'uncategorized') {
        query.category = req.query.category;
    }

    // 3. Ambil SEMUA Post yang sesuai filter pencarian
    const allPosts = await Post.find(query);

    // =================================================================================
    // 4. ALGORITMA EUCLIDEAN DISTANCE (SAMA DENGAN FRONTEND)
    // =================================================================================
    const scoredPosts = allPosts.map((post) => {
      let distanceSquared = 0;

      // --- A. Jenjang Pendidikan (Penalty: 1.0) ---
      const userEdu = user.educationLevel || "Umum";
      const reqEdu = post.criteriaEducationLevel || "Umum";
      
      // Jika beasiswa minta spesifik (Bukan Umum), dan user beda jenjang -> Penalty
      if (reqEdu !== "Umum" && reqEdu !== userEdu) {
          distanceSquared += Math.pow(1.0, 2); 
      }

      // --- B. Jurusan (Penalty: 0.5) ---
      const userMajor = user.major || "";
      const reqMajor = post.criteriaMajor || "";
      if (reqMajor !== "") {
          // Jika jurusan user tidak mengandung kata kunci syarat
          if (!userMajor.toLowerCase().includes(reqMajor.toLowerCase())) {
              distanceSquared += Math.pow(0.5, 2); 
          }
      }

      // --- C. IPK (Numeric) ---
      const valUserGPA = parseFloat(userGPA) || 0;
      const reqGPA = parseFloat(post.criteriaMinGPA) || 0;
      
      if (reqGPA > 0) {
          // Normalisasi skala 0-4
          const normUserGPA = valUserGPA / 4.0;
          const normReqGPA = reqGPA / 4.0;
          
          if (valUserGPA < reqGPA) {
             // Jika IPK User KURANG dari syarat -> Penalty Jarak
             const diff = normReqGPA - normUserGPA;
             distanceSquared += Math.pow(diff + 0.5, 2); // Penalty tambahan 0.5 biar jatuh kebawah
          } 
          // Jika IPK User >= Syarat, Jarak = 0 (Sangat Cocok)
      }

      // --- D. Lokasi (Penalty: 0.3) ---
      const userLoc = user.location || "";
      const reqLoc = post.criteriaLocation || "";
      if (reqLoc !== "") {
          if (!userLoc.toLowerCase().includes(reqLoc.toLowerCase())) {
              distanceSquared += Math.pow(0.3, 2); 
          }
      }

      // --- E. Ekonomi (Numeric) ---
      // PENTING: Gunakan variable userIncome yang sudah kita perbaiki di atas
      const valUserIncome = parseFloat(userIncome) || 0;
      const maxIncome = parseFloat(post.criteriaMaxIncome) || 0;
      
      if (maxIncome > 0) {
          // Normalisasi bagi 10juta
          const normUserIncome = Math.min(valUserIncome, 10000000) / 10000000;
          const normMaxIncome = Math.min(maxIncome, 10000000) / 10000000;

          if (valUserIncome > maxIncome) {
              // Jika gaji ortu ketinggian (lebih kaya dari syarat) -> Penalty
              const diffIncome = normUserIncome - normMaxIncome;
              distanceSquared += Math.pow(diffIncome * 1.5, 2); // Bobot x1.5 (Ekonomi penting)
          }
      }

      // --- HASIL AKHIR ---
      // Semakin kecil distance (mendekati 0), semakin cocok.
      const finalDistance = Math.sqrt(distanceSquared);

      return { ...post._doc, distance: finalDistance };
    });

    // 5. SORTING (Ascending: Jarak Terkecil di Atas)
    // Jarak 0 = Sangat Cocok
    // Jarak 1+ = Kurang Cocok
    scoredPosts.sort((a, b) => a.distance - b.distance);

    // 6. Pagination
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const paginatedPosts = scoredPosts.slice(startIndex, startIndex + limit);

    res.status(200).json({ posts: paginatedPosts, totalPosts: allPosts.length });

  } catch (error) {
    console.error("Error Recommendation:", error);
    next(error);
  }
};