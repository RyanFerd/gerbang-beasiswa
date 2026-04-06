import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calculator, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  GraduationCap,
  MapPin,
  BookOpen,
  DollarSign,
  Target
} from "lucide-react";

export default function Recommendation() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const postId = queryParams.get("postId");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [analysis, setAnalysis] = useState([]);

  // --- 1. AMBIL DATA POSTINGAN ---
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        
        if (res.ok) {
          setPost(data.posts[0]);
          if (currentUser) {
            calculateEuclidean(data.posts[0], currentUser);
          }
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, currentUser]);

  // --- 2. RUMUS EUCLIDEAN DISTANCE + ALASAN DETAIL (FEEDBACK DOSEN) ---
  const calculateEuclidean = (scholarship, user) => {
    let steps = [];
    let distanceSquared = 0;

    // ---------------------------------------------------------
    // A. ANALISIS JENJANG (Education Level)
    // ---------------------------------------------------------
    const userEdu = user.educationLevel || "Umum"; 
    
    let reqEdu = scholarship.criteriaEducationLevel || "Umum";
    if (reqEdu !== "Umum" && !Array.isArray(reqEdu)) {
        reqEdu = [reqEdu]; 
    }

    let eduStatus = "Sesuai";
    let eduPenalty = 0;
    let isEduMatch = true;
    let eduReason = "Jenjang pendidikan Anda memenuhi kriteria.";

    if (reqEdu === "Umum") {
        isEduMatch = true;
        eduReason = "Beasiswa ini terbuka untuk semua jenjang.";
    } else {
        isEduMatch = reqEdu.includes(userEdu);
    }

    if (!isEduMatch) {
        eduPenalty = 1.0; 
        eduStatus = "Tidak Sesuai";
        distanceSquared += Math.pow(eduPenalty, 2);
        // [MODIFIKASI] Alasan spesifik
        eduReason = `Anda saat ini jenjang ${userEdu}, sedangkan beasiswa ini khusus untuk: ${reqEdu.join(", ")}.`;
    }

    let displayReqVal = "Semua Jenjang";
    if (Array.isArray(reqEdu)) {
        displayReqVal = reqEdu.join(", "); 
    } else if (reqEdu !== "Umum") {
        displayReqVal = reqEdu;
    }

    steps.push({
        icon: <GraduationCap size={16} />,
        label: "Jenjang Pendidikan",
        userVal: userEdu,
        reqVal: displayReqVal,
        status: eduStatus,
        isMatch: isEduMatch,
        reason: eduReason // Masukkan alasan ke object
    });

    // ---------------------------------------------------------
    // B. ANALISIS JURUSAN (Major)
    // ---------------------------------------------------------
    const userMajor = user.major || "-";
    const reqMajor = scholarship.criteriaMajor || ""; 
    
    let majorStatus = "Sesuai / Umum";
    let majorPenalty = 0;
    let majorReason = "Jurusan Anda relevan atau beasiswa bersifat umum.";

    if (reqMajor !== "") {
        if (!userMajor.toLowerCase().includes(reqMajor.toLowerCase())) {
            majorPenalty = 0.5; 
            majorStatus = "Tidak Sesuai";
            distanceSquared += Math.pow(majorPenalty, 2);
            // [MODIFIKASI] Alasan spesifik
            majorReason = `Jurusan Anda (${userMajor}) tidak termasuk dalam target bidang studi beasiswa ini (${reqMajor}).`;
        } else {
            majorStatus = "Cocok";
            majorReason = "Bidang studi Anda sesuai dengan prioritas beasiswa.";
        }
    }

    steps.push({
        icon: <BookOpen size={16} />,
        label: "Jurusan / Bidang",
        userVal: userMajor,
        reqVal: reqMajor || "Semua Jurusan",
        status: majorStatus,
        isMatch: majorPenalty === 0,
        reason: majorReason
    });

    // ---------------------------------------------------------
    // C. ANALISIS IPK (GPA)
    // ---------------------------------------------------------
    const userGPA = user.gpa || 0;
    const reqGPA = scholarship.criteriaMinGPA || 0;
    
    const normUserGPA = userGPA / 4.0;
    const normReqGPA = reqGPA / 4.0;
    
    const diffGPA = Math.max(0, normReqGPA - normUserGPA); 
    distanceSquared += Math.pow(diffGPA, 2);
    
    let gpaReason = "IPK Anda di atas batas minimal.";
    if (userGPA < reqGPA) {
        // [MODIFIKASI] Alasan spesifik
        gpaReason = `IPK Anda (${userGPA.toFixed(2)}) masih kurang ${ (reqGPA - userGPA).toFixed(2) } poin dari syarat minimal.`;
    }

    steps.push({
      icon: <Target size={16} />,
      label: "Minimal IPK",
      userVal: userGPA.toFixed(2),
      reqVal: reqGPA > 0 ? reqGPA.toFixed(2) : "Tidak Ada",
      status: userGPA >= reqGPA ? "Memenuhi" : "Kurang",
      isMatch: userGPA >= reqGPA,
      reason: gpaReason
    });

    // ---------------------------------------------------------
    // D. ANALISIS LOKASI (Location)
    // ---------------------------------------------------------
    const userLoc = user.location || "-";
    const reqLoc = scholarship.criteriaLocation || ""; 
    
    let locStatus = "Terjangkau / Daring";
    let locPenalty = 0;
    let locReason = "Lokasi domisili Anda masuk dalam cakupan wilayah.";

    if (reqLoc !== "") {
        if (!userLoc.toLowerCase().includes(reqLoc.toLowerCase())) {
            locPenalty = 0.3; 
            locStatus = "Beda Lokasi";
            distanceSquared += Math.pow(locPenalty, 2);
            // [MODIFIKASI] Alasan spesifik
            locReason = `Domisili Anda di ${userLoc}, namun beasiswa ini diutamakan untuk wilayah ${reqLoc}.`;
        } else {
            locStatus = "Satu Wilayah";
        }
    }

    steps.push({
        icon: <MapPin size={16} />,
        label: "Domisili",
        userVal: userLoc,
        reqVal: reqLoc || "Seluruh Indonesia",
        status: locStatus,
        isMatch: locPenalty === 0,
        reason: locReason
    });

    // ---------------------------------------------------------
    // E. ANALISIS EKONOMI (Income)
    // ---------------------------------------------------------
    const userIncome = user.income || 0;
    const maxIncome = scholarship.criteriaMaxIncome || 0; 
    
    let ecoStatus = "Aman";
    let isEcoMatch = true;
    let ecoReason = "Penghasilan orang tua memenuhi syarat (kurang mampu / sesuai batas).";

    if (maxIncome > 0) {
        const normUserIncome = Math.min(userIncome, 10000000) / 10000000;
        const normMaxIncome = Math.min(maxIncome, 10000000) / 10000000;

        const diffIncome = Math.max(0, normUserIncome - normMaxIncome);
        
        if (diffIncome > 0) {
            ecoStatus = "Terlalu Tinggi";
            isEcoMatch = false;
            // [MODIFIKASI] Alasan spesifik
            ecoReason = `Penghasilan ortu (Rp ${userIncome.toLocaleString()}) melebihi batas maksimal syarat bantuan (Rp ${maxIncome.toLocaleString()}).`;
        } else {
            ecoStatus = "Memenuhi Syarat";
        }

        distanceSquared += Math.pow(diffIncome * 1.5, 2); 
        
        steps.push({
            icon: <DollarSign size={16} />,
            label: "Ekonomi (Gaji Ortu)",
            userVal: `Rp ${userIncome.toLocaleString()}`,
            reqVal: `Max Rp ${maxIncome.toLocaleString()}`,
            status: ecoStatus,
            isMatch: isEcoMatch,
            reason: ecoReason
        });
    } else {
        steps.push({
            icon: <DollarSign size={16} />,
            label: "Ekonomi (Gaji Ortu)",
            userVal: `Rp ${userIncome.toLocaleString()}`,
            reqVal: "Tidak Ada Batas",
            status: "Bebas",
            isMatch: true,
            reason: "Beasiswa ini tidak membatasi latar belakang ekonomi (Merit Based)."
        });
    }

    // ---------------------------------------------------------
    // HASIL AKHIR
    // ---------------------------------------------------------
    const euclideanDistance = Math.sqrt(distanceSquared);
    const similarity = 1 / (1 + euclideanDistance); 
    
    const finalPercentage = Math.min(similarity * 100, 100).toFixed(1);

    setAnalysis(steps);
    setScore(finalPercentage);
  };

  // --- TAMPILAN JIKA BELUM LOGIN ---
  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Ditolak</h2>
            <p className="text-slate-500 mb-6">Anda harus login dan melengkapi data profil untuk menggunakan fitur analisis rekomendasi ini.</p>
            <Link to="/sign-in"><Button className="w-full">Login Sekarang</Button></Link>
        </div>
    </div>
  );

  if (loading) return (
     <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
     </div>
  );

  if (!post) return <div className="text-center mt-20 text-slate-500">Data Beasiswa Tidak Ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Nav */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 text-slate-500 hover:text-blue-700 transition">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Detail Beasiswa
        </Button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* 1. Header Card */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Analisis Kecocokan Beasiswa</h1>
                <p className="text-blue-100 flex items-center gap-2">
                    <Calculator size={18} /> Metode Euclidean Distance Probability
                </p>
                <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium border border-white/30">
                    Target: {post.title}
                </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 items-start">
                
                {/* 2. KOLOM KIRI: GAUGE CHART (SKOR) */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-700">Skor Peluang</h3>
                    
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="#e2e8f0" strokeWidth="16" fill="transparent" />
                            <circle 
                                cx="96" cy="96" r="80" 
                                stroke="currentColor" strokeWidth="16" fill="transparent" 
                                strokeDasharray={2 * Math.PI * 80}
                                strokeDashoffset={2 * Math.PI * 80 - (score / 100) * (2 * Math.PI * 80)}
                                strokeLinecap="round"
                                className={`${score > 75 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center animate-in fade-in zoom-in duration-700">
                            <span className="text-5xl font-extrabold text-slate-800">{score}%</span>
                            <span className="text-xs text-slate-500 uppercase font-semibold mt-1">Match</span>
                        </div>
                    </div>

                    <div className={`px-4 py-3 rounded-xl border w-full ${score > 75 ? "bg-green-50 border-green-200 text-green-800" : score > 50 ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                        <p className="text-sm font-bold">
                            {score > 80 ? "Sangat Direkomendasikan! 🚀" : 
                             score > 50 ? "Cukup Berpotensi 👍" : 
                             "Kecocokan Rendah 💪"}
                        </p>
                    </div>
                </div>

                {/* 3. KOLOM KANAN: RINCIAN 5 KRITERIA */}
                <div className="space-y-6 w-full">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xl text-slate-800">Rincian & Evaluasi</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">5 Parameter</span>
                    </div>
                    
                    <div className="space-y-3">
                        {analysis.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
                                <div className="flex items-start gap-4 w-full">
                                    <div className={`p-2 rounded-full mt-1 shrink-0 ${item.isMatch ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                                        {item.icon}
                                    </div>
                                    <div className="w-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                                                <div className="flex flex-col sm:flex-row sm:gap-6 text-sm">
                                                    <span className="text-slate-500">Profil: <span className="font-semibold text-slate-800">{item.userVal}</span></span>
                                                    <span className="text-slate-500">Syarat: <span className="font-semibold text-slate-800">{item.reqVal}</span></span>
                                                </div>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <div className="text-right pl-2 shrink-0">
                                                {item.isMatch ? (
                                                    <CheckCircle className="text-green-500 w-5 h-5 ml-auto mb-1" />
                                                ) : (
                                                    <XCircle className="text-red-400 w-5 h-5 ml-auto mb-1" />
                                                )}
                                                <p className={`text-[10px] font-bold uppercase ${item.isMatch ? "text-green-600" : "text-red-500"}`}>
                                                    {item.status}
                                                </p>
                                            </div>
                                        </div>

                                        {/* BAGIAN TAMBAHAN: Keterangan / Alasan (Feedback Dosen) */}
                                        <div className={`mt-2 text-xs p-2 rounded ${item.isMatch ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-700 font-medium'}`}>
                                            <span className="mr-1">{item.isMatch ? '✅' : '⚠️'}</span>
                                            {item.reason}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 4. FOOTER ACTION */}
            <div className="bg-slate-50 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center border-t border-slate-200 gap-4">
                <div className="text-sm text-slate-500 italic max-w-lg text-center md:text-left">
                    *Hasil ini adalah simulasi sistem pendukung keputusan. Keputusan akhir tetap berada di tangan panitia seleksi beasiswa.
                </div>
                <div className="flex gap-3">
                    <Link to={`/post/${post.slug}`}>
                        <Button variant="outline" className="border-slate-300">Kembali</Button>
                    </Link>
                    <Button className="bg-blue-700 hover:bg-blue-800 px-6">
                        Lanjut Mendaftar
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}