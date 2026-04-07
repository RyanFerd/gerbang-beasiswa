import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Filter, 
  Search as SearchIcon, 
  RotateCcw, 
  Loader2, 
  FileWarning, 
  Sparkles, 
  Lock,
  Calendar,
  ArrowRight,
  Target,
  Info 
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { useSelector } from "react-redux"

const Search = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user)

  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    educationLevel: "all", 
  })

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [isRecommendationMode, setIsRecommendationMode] = useState(false)

  const getExcerpt = (htmlContent, length = 150) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = htmlContent;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  }

  const formatCategory = (cat) => {
      const map = {
          'uncategorized': 'Umum',
          'beasiswa': 'Beasiswa',
          'edukasi': 'Edukasi',
          'event': 'Event',
          'berita': 'Berita'
      };
      return map[cat] || cat;
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const recommendationParam = urlParams.get("recommendation")
    setIsRecommendationMode(recommendationParam === 'true' && currentUser)

    const searchTermFromUrl = urlParams.get("searchTerm")
    const sortFromUrl = urlParams.get("sort")
    const educationLevelFromUrl = urlParams.get("educationLevel")

    if (searchTermFromUrl || sortFromUrl || educationLevelFromUrl) {
      setSidebarData({
        searchTerm: searchTermFromUrl || "",
        sort: sortFromUrl || "desc",
        educationLevel: educationLevelFromUrl || "all", 
      })
    }

    const fetchPosts = async () => {
      setLoading(true)
      const searchQuery = urlParams.toString()
      try {
        let res;
        if (recommendationParam === 'true' && currentUser) {
            res = await fetch(`/api/recommendation/suggest/${currentUser._id}?${searchQuery}`)
        } else {
            res = await fetch(`/api/post/getposts?${searchQuery}`)
        }
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        setPosts(data.posts)
        setLoading(false)
        setShowMore(data.posts.length === 9)
      } catch (error) {
        console.log(error); setLoading(false)
      }
    }
    fetchPosts()
  }, [location.search, currentUser])

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") setSidebarData({ ...sidebarData, searchTerm: e.target.value })
  }

  const handleReset = () => {
      setSidebarData({ searchTerm: "", sort: "desc", educationLevel: "all" })
      setIsRecommendationMode(false)
      navigate("/search")
  }

  const toggleRecommendationMode = () => {
      const urlParams = new URLSearchParams(location.search)
      if (!isRecommendationMode) {
          urlParams.set("recommendation", "true"); urlParams.delete("sort") 
      } else {
          urlParams.delete("recommendation")
      }
      navigate(`/search?${urlParams.toString()}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const urlParams = new URLSearchParams(location.search)
    urlParams.set("searchTerm", sidebarData.searchTerm)
    urlParams.set("sort", sidebarData.sort)
    if (sidebarData.educationLevel && sidebarData.educationLevel !== 'all') {
        urlParams.set("educationLevel", sidebarData.educationLevel)
    } else { urlParams.delete("educationLevel") }
    urlParams.delete("category")
    if (isRecommendationMode) urlParams.set("recommendation", "true")
    navigate(`/search?${urlParams.toString()}`)
  }

  const handleShowMore = async () => {
    const startIndex = posts.length
    const urlParams = new URLSearchParams(location.search)
    urlParams.set("startIndex", startIndex)
    const searchQuery = urlParams.toString()
    try {
        let res;
        if (isRecommendationMode && currentUser) {
             res = await fetch(`/api/recommendation/suggest/${currentUser._id}?${searchQuery}`)
        } else {
             res = await fetch(`/api/post/getposts?${searchQuery}`)
        }
        if (res.ok) {
            const data = await res.json()
            setPosts([...posts, ...data.posts])
            setShowMore(data.posts.length === 9)
        }
    } catch (error) { console.log(error) }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 items-start">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-1/4 bg-white border-r border-gray-200 shadow-sm z-10 
          md:sticky md:top-20 md:h-[calc(100vh-80px)] md:overflow-y-auto custom-scrollbar">
        
        <div className="p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter
                </h2>
                <button onClick={handleReset} className="text-gray-400 hover:text-red-500 transition" title="Reset Filter">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* 1. KATA KUNCI */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kata Kunci</label>
                    <div className="relative">
                        <Input
                            placeholder="Cari beasiswa..."
                            id="searchTerm"
                            className="pl-9 bg-slate-50 h-9 text-sm focus-visible:ring-blue-500"
                            value={sidebarData.searchTerm}
                            onChange={handleChange}
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    </div>
                </div>

                {/* 2. URUTKAN */}
                {!isRecommendationMode && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Urutkan</label>
                        <Select onValueChange={(value) => setSidebarData({ ...sidebarData, sort: value })} value={sidebarData.sort}>
                            <SelectTrigger className="w-full bg-slate-50 h-9 text-sm">
                                <SelectValue placeholder="Pilih Urutan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Terbaru</SelectItem>
                                <SelectItem value="asc">Terlama</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* 3. TARGET JENJANG (Update S2 & S3) */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Jenjang</label>
                    <Select onValueChange={(value) => setSidebarData({ ...sidebarData, educationLevel: value })} value={sidebarData.educationLevel}>
                        <SelectTrigger className="w-full bg-slate-50 h-9 text-sm">
                            <SelectValue placeholder="Pilih Jenjang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Jenjang</SelectItem>
                            <SelectItem value="TK">TK / PAUD</SelectItem>
                            <SelectItem value="SD">SD / MI</SelectItem>
                            <SelectItem value="SMP">SMP / MTs</SelectItem>
                            <SelectItem value="SMA">SMA / SMK / Sederajat</SelectItem>
                            <SelectItem value="Diploma">Diploma (D3 / D4)</SelectItem>
                            <SelectItem value="S1">Sarjana (S1)</SelectItem>
                            <SelectItem value="S2">Magister (S2)</SelectItem>
                            <SelectItem value="S3">Doktor (S3)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 4. REKOMENDASI CERDAS */}
                <div className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    isRecommendationMode ? "bg-yellow-50 border-yellow-400 shadow-md" : "bg-blue-50/50 border-blue-100"
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className={`w-4 h-4 ${isRecommendationMode ? "text-yellow-600" : "text-blue-500"}`} />
                            <h3 className={`text-sm font-bold ${isRecommendationMode ? "text-yellow-800" : "text-blue-900"}`}>
                                Rekomendasi Cerdas
                            </h3>
                        </div>
                        <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Sistem mencocokkan kriteria beasiswa dengan data profil Anda secara otomatis.
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                        <p className="text-[10px] text-slate-600 flex items-start gap-1">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>Cek otomatis Jurusan, IPK, & Jenjang</span>
                        </p>
                        <p className="text-[10px] text-slate-600 flex items-start gap-1">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>Prioritas beasiswa paling sesuai</span>
                        </p>
                    </div>

                    {currentUser ? (
                        <Button 
                            type="button"
                            onClick={toggleRecommendationMode}
                            size="sm"
                            className={`w-full h-8 text-xs font-bold transition-transform active:scale-95 ${
                                isRecommendationMode 
                                ? "bg-yellow-500 hover:bg-yellow-600 text-black border-none" 
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                        >
                            {isRecommendationMode ? "Matikan Fitur" : "Aktifkan"}
                        </Button>
                    ) : (
                        <div className="bg-slate-200/50 p-1.5 rounded text-center">
                             <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><Lock className="w-3 h-3"/> Login untuk akses</p>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-semibold h-10 shadow-lg transition-all active:scale-[0.98]">
                        Terapkan Filter
                    </Button>
                </div>
            </form>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="w-full md:w-3/4 p-6 md:p-8">
            <div className="flex flex-col mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isRecommendationMode ? "Rekomendasi Untuk Anda" : "Arsip Beasiswa"}
                </h1>
                <p className="text-slate-500 text-sm">
                    Menampilkan {posts.length} artikel beasiswa
                </p>
            </div>
            
            <Separator className="bg-gray-200 mb-8" />
            
            {loading && (
                <div className="flex flex-col justify-center items-center py-20 text-gray-400">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                    <p>Memuat data...</p>
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="flex flex-col justify-center items-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <FileWarning className="h-16 w-16 mb-4 text-gray-300" />
                    <p>Tidak ada beasiswa ditemukan.</p>
                </div>
            )}

            {/* List Artikel */}
            <div className="flex flex-col gap-6">
                 {!loading && posts.map((post) => (
                    <div 
                        key={post._id} 
                        className={`group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row
                        ${isRecommendationMode && post.distance === 0 ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"}
                        `}
                    >
                        {isRecommendationMode && (
                             <div className="absolute top-0 right-0 z-20">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm 
                                    ${post.distance === 0 ? "bg-blue-600 text-white" : "bg-green-100 text-green-700 border-l border-b border-green-200"}`}>
                                    {post.distance === 0 ? "⭐ Sangat Cocok" : "✅ Memenuhi Kriteria"}
                                </span>
                             </div>
                        )}

                        <div className="w-full md:w-56 h-48 md:h-auto flex-shrink-0 relative overflow-hidden bg-slate-100">
                            <Link to={`/post/${post.slug}`}>
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                            </Link>
                            <div className="absolute bottom-2 left-2">
                                <span className="bg-white/90 backdrop-blur-sm text-blue-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase">
                                    {formatCategory(post.category)}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col justify-between flex-1">
                            <div>
                                <div className="flex items-center gap-3 text-slate-400 text-xs mb-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString('id-ID')}
                                    </span>
                                    {post.criteriaEducationLevel && (
                                        <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                            <Target size={12} />
                                            {Array.isArray(post.criteriaEducationLevel) 
                                                ? post.criteriaEducationLevel[0] + (post.criteriaEducationLevel.length > 1 ? "..." : "") 
                                                : post.criteriaEducationLevel}
                                        </span>
                                    )}
                                </div>
                                <Link to={`/post/${post.slug}`}>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                                        {post.title}
                                    </h3>
                                </Link>
                                <p className="text-slate-600 text-sm line-clamp-2 md:line-clamp-3 leading-relaxed mb-4">
                                    {getExcerpt(post.content)}
                                </p>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Link to={`/post/${post.slug}`}>
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1 p-0 h-auto font-semibold transition-all">
                                        Baca Selengkapnya <ArrowRight size={16} />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                  ))}
            </div>

             {showMore && (
                <div className="mt-10 text-center">
                    <Button onClick={handleShowMore} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        Muat Lebih Banyak
                    </Button>
                </div>
            )}
      </div>
    </div>
  )
}

export default Search