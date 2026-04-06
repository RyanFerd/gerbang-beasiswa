import React, { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Info,
  GraduationCap, 
  MapPin,       
  BookOpen,      
  DollarSign,    
  Target,
  ExternalLink 
} from "lucide-react"

// Pastikan path ini BENAR sesuai folder project abang.
import CommentSection from "@/components/shared/CommentSection"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const PostDetails = () => {
  const { postSlug } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [post, setPost] = useState(null)
  const [recentArticles, setRecentArticles] = useState([])

  // --- 1. HELPERS (Formatters) ---

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const formatJenjang = (level) => {
    if (!level) return "Semua Jenjang";
    const map = {
        'SMA': 'SMA / Sederajat',
        'Diploma': 'Diploma (D3 / D4)',
        'S1': 'Sarjana (S1)',
        'Pascasarjana': 'Pascasarjana (S2 / S3)',
        'S2': 'Pascasarjana (S2)',
        'S3': 'Doktoral (S3)'
    };
    if (Array.isArray(level)) {
        if (level.length === 0) return "Semua Jenjang";
        return level.map(l => map[l] || l).join(", ");
    }
    return map[level] || level; 
  };

  const formatKategori = (cat) => {
      const map = {
          'uncategorized': 'Umum',
          'beasiswa': 'Info Beasiswa',
          'edukasi': 'Edukasi & Tips',
          'event': 'Event & Lomba',
          'berita': 'Berita'
      };
      return map[cat] || cat;
  }

  const formatDate = (dateString) => {
      if(!dateString) return "-";
      return new Date(dateString).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
      });
  }

  const ensureHttp = (link) => {
    if (!link) return "#";
    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link;
    }
    return `https://${link}`;
  };

  // --- 2. FETCHING DATA ---

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`)
        const data = await res.json()

        if (!res.ok) {
          setError(true)
          setLoading(false)
          return
        }

        if (res.ok && data.posts && data.posts.length > 0) {
          setPost(data.posts[0])
          setError(false)
        } else {
            setError(true) // Post tidak ditemukan
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (postSlug) {
        fetchPost()
    }
  }, [postSlug])

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?limit=3`)
        const data = await res.json()
        if (res.ok) {
          setRecentArticles(data.posts || [])
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    fetchRecentPosts()
  }, [])

  // --- 3. LOADING & ERROR STATES ---

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Memuat detail beasiswa...</p>
      </div>
    )
  }

  if (error || !post) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
              <h1 className="text-2xl font-bold text-slate-700">Halaman tidak ditemukan</h1>
              <Button onClick={() => navigate('/')}>Kembali ke Beranda</Button>
          </div>
      )
  }

  // --- 4. LOGIKA PERIODE (SAFE MODE) ---
  const now = new Date();
  now.setHours(0, 0, 0, 0); 

  let isUpcoming = false;
  let isExpired = false;
  let isOpen = true;

  if (post?.startDate) {
      const start = new Date(post.startDate);
      start.setHours(0, 0, 0, 0); 
      isUpcoming = now.getTime() < start.getTime();
  }

  if (post?.deadline) {
      const end = new Date(post.deadline);
      end.setHours(0, 0, 0, 0); 
      isExpired = now.getTime() > end.getTime();
  }

  isOpen = !isUpcoming && !isExpired;
  
  // --- 5. RENDER ---
  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-white">
      
      {/* HEADER BUTTON */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 text-slate-500 hover:text-blue-900 pl-0 gap-2"
      >
        <ArrowLeft size={18} /> Kembali
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
        
        {/* === KIRI: KONTEN UTAMA === */}
        <article className="flex flex-col">
            
            {/* Kategori */}
            <div className="flex gap-2 mb-4">
                <Link to={`/search?category=${post?.category}`}>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider hover:bg-blue-200 transition">
                        {formatKategori(post?.category)}
                    </span>
                </Link>
            </div>

            {/* Judul */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                {post?.title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-6 text-slate-500 text-sm mb-8 border-b border-slate-100 pb-6">
                <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(post?.createdAt)}
                </span>
                <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {/* Fallback ke 1 menit jika content length error */}
                    {Math.ceil((post?.content?.length || 0) / 1000) || 1} menit baca
                </span>
            </div>

            {/* Gambar */}
            {post?.image && (
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full max-h-[500px] object-cover rounded-2xl shadow-lg mb-8"
                />
            )}

            {/* === KOTAK PERSYARATAN (KONDISIONAL) === */}
            {(post?.category === 'beasiswa' || (post?.criteriaEducationLevel?.length > 0) || post?.criteriaMaxIncome) && (
            <div className="bg-slate-50 border-l-4 border-blue-600 p-6 rounded-r-lg shadow-sm mb-10">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="text-blue-600" />
                    Kualifikasi & Persyaratan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    {/* Jenjang */}
                    <div className="flex items-start gap-3">
                        <GraduationCap className="text-slate-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Target Jenjang</p>
                            <p className="text-slate-800 font-medium">
                                {formatJenjang(post?.criteriaEducationLevel)}
                            </p>
                        </div>
                    </div>

                    {/* Jurusan */}
                    <div className="flex items-start gap-3">
                        <BookOpen className="text-slate-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Jurusan</p>
                            <p className="text-slate-800 font-medium">
                                {post?.criteriaMajor || "Semua Jurusan / Umum"}
                            </p>
                        </div>
                    </div>

                    {/* IPK */}
                    <div className="flex items-start gap-3">
                        <Target className="text-slate-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Minimal IPK</p>
                            <p className="text-slate-800 font-medium">
                                {post?.criteriaMinGPA > 0 ? post.criteriaMinGPA.toFixed(2) : "Tidak ada batas minimal"}
                            </p>
                        </div>
                    </div>

                    {/* Lokasi */}
                    <div className="flex items-start gap-3">
                        <MapPin className="text-slate-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Lokasi</p>
                            <p className="text-slate-800 font-medium">
                                {post?.criteriaLocation || "Seluruh Indonesia"}
                            </p>
                        </div>
                    </div>

                    {/* Ekonomi */}
                    <div className="flex items-start gap-3 md:col-span-2">
                        <DollarSign className="text-slate-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Syarat Ekonomi (Penghasilan Ortu)</p>
                            <p className="text-slate-800 font-medium">
                                {post?.criteriaMaxIncome > 0 
                                    ? `Maksimal ${formatRupiah(post.criteriaMaxIncome)} per bulan` 
                                    : "Tidak ada batasan ekonomi"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Isi Konten */}
            <div 
                className="post-content text-slate-700 leading-relaxed text-lg space-y-6"
                dangerouslySetInnerHTML={{ __html: post?.content || "<p>Konten tidak tersedia.</p>" }}
            ></div>

            {/* Share */}
            <div className="mt-12 pt-6 border-t border-slate-200">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Share2 size={16} /> Bagikan informasi ini:
                </p>
                <div className="flex gap-2">
                     <Button variant="outline" size="sm">Facebook</Button>
                     <Button variant="outline" size="sm">Twitter</Button>
                     <Button variant="outline" size="sm">WhatsApp</Button>
                </div>
            </div>
        </article>

        {/* === KANAN: SIDEBAR === */}
        <aside className="space-y-8 h-fit sticky top-24 self-start">
            
            {/* Box Status Pendaftaran */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Info size={20} className="text-amber-500" />
                    Info Pendaftaran
                </h3>
                
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500 font-semibold">Tipe</p>
                        <span className="font-medium text-slate-800 capitalize bg-slate-100 px-3 py-1 rounded-full text-xs">
                            {formatKategori(post?.category)}
                        </span>
                    </div>
                    
                    <Separator />

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-500 font-semibold">Status Beasiswa</p>
                            
                            {isExpired && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200">
                                    ⛔ Ditutup
                                </span>
                            )}
                            {isUpcoming && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md border border-yellow-200">
                                    ⏳ Segera Dibuka
                                </span>
                            )}
                            {isOpen && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md border border-green-200">
                                    <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                                    Buka / Aktif
                                </span>
                            )}
                        </div>

                        <div className="bg-slate-50 p-3 rounded text-xs space-y-2 border border-slate-100">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Mulai:</span>
                                <span className="font-semibold text-slate-700">
                                    {formatDate(post?.startDate) || "TBA"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Selesai:</span>
                                <span className="font-semibold text-slate-700">
                                    {formatDate(post?.deadline) || "Selamanya"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-800 font-medium mb-1">💡 Info Penting</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Cek peluang untuk melihat kecocokan Anda sebelum mendaftar ke website resmi.
                        </p>
                    </div>

                    {/* --- TOMBOL UTAMA --- */}
                    <div className="flex flex-col gap-3">
                        {isExpired ? (
                            <Button disabled className="w-full bg-slate-300 text-slate-500 font-bold h-12 cursor-not-allowed">
                                Pendaftaran Ditutup
                            </Button>
                        ) : isUpcoming ? (
                             <Button disabled className="w-full bg-yellow-100 text-yellow-700 border border-yellow-300 font-bold h-12 cursor-not-allowed">
                                Pendaftaran Belum Dibuka
                            </Button>
                        ) : (
                            <>
                                {/* 1. TOMBOL CEK PELUANG (Internal) */}
                                <Link to={`/recommendation?postId=${post?._id}`} className="block">
                                    <Button variant="outline" className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 font-bold h-12">
                                        Cek Peluang Saya
                                    </Button>
                                </Link>

                                {/* 2. TOMBOL LANJUT MENDAFTAR (External) */}
                                {post?.officialLink ? (
                                    <a 
                                        href={ensureHttp(post.officialLink)} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="block w-full"
                                    >
                                        <Button className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold h-12 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                            Lanjut Mendaftar <ExternalLink size={18} />
                                        </Button>
                                    </a>
                                ) : (
                                    <Button disabled className="w-full bg-slate-200 text-slate-400 font-bold h-12 cursor-not-allowed">
                                        Link Belum Tersedia
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>

            {/* Recent Articles */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                 <h3 className="text-md font-bold text-slate-800 mb-4">Beasiswa Terbaru Lainnya</h3>
                 <div className="flex flex-col gap-4">
                    {recentArticles && recentArticles.length > 0 ? (
                        recentArticles.map((article) => (
                            <Link to={`/post/${article.slug}`} key={article._id} className="group flex gap-3 items-start p-2 hover:bg-white rounded-lg transition duration-200">
                                <img 
                                    src={article.image} 
                                    alt={article.title} 
                                    className="w-16 h-16 object-cover rounded-md group-hover:scale-105 transition duration-300"
                                />
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-2 leading-snug">
                                        {article.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 block mt-1">
                                        {new Date(article.createdAt).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-xs text-slate-500">Belum ada artikel lain.</p>
                    )}
                 </div>
            </div>
        </aside>

      </div>

      {/* FOOTER COMMENTS */}
      {post?._id && (
        <div className="mt-16 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Diskusi & Pertanyaan</h2>
            <CommentSection postId={post._id} />
        </div>
      )}

    </main>
  )
}

export default PostDetails