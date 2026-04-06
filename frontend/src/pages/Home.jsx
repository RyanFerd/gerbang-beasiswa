import PostCard from "@/components/shared/PostCard"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, Zap, Database, CheckCircle } from "lucide-react" // Pastikan import ikon ini
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const Home = () => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/post/getPosts?limit=6")
        const data = await res.json()
        if (res.ok) {
          setPosts(data.posts)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. HERO SECTION: Kesan Pertama yang Kuat & Akademis */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Gerbang <span className="text-yellow-400">Beasiswa</span>
          </h1>
          
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Temukan peluang studi yang paling <strong>tepat</strong> untuk Anda. 
            Sistem rekomendasi cerdas kami mencocokkan profil akademik dan ekonomi Anda 
            dengan ribuan beasiswa menggunakan algoritma presisi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            {/* Tombol Utama: Arahkan ke Dashboard/Input Profil */}
            <Link to={"/dashboard"}>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-6 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Cari Rekomendasi Saya
              </Button>
            </Link>
            
            {/* Tombol Sekunder: Arahkan ke Pencarian Manual */}
            <Link to={"/search"}>
              <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 py-6 px-8 rounded-full text-lg transition-all duration-300">
                Lihat Semua Beasiswa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. VALUE PROPOSITION: Mengapa menggunakan sistem ini? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Mengapa Memilih Gerbang Beasiswa?
          </h2>
          <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
            Kami menggunakan pendekatan <i>Content-Based Filtering</i> untuk memastikan Anda tidak membuang waktu melamar beasiswa yang tidak sesuai kriteria.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Rekomendasi Personal"
              description="Sistem menghitung kecocokan profil Anda (IPK, Jurusan, Ekonomi) dengan syarat beasiswa secara otomatis."
              icon={<Target className="w-12 h-12 text-blue-600" />}
            />

            <FeatureCard
              title="Hemat Waktu"
              description="Tidak perlu membaca ratusan syarat satu per satu. Kami urutkan prioritas beasiswa terbaik untuk Anda."
              icon={<Zap className="w-12 h-12 text-yellow-500" />}
            />

            <FeatureCard
              title="Database Terlengkap"
              description="Akses informasi beasiswa dalam negeri dari pemerintah, swasta, hingga yayasan yang selalu diperbarui."
              icon={<Database className="w-12 h-12 text-green-600" />}
            />
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS: Edukasi User (Penting untuk Skripsi) */}
      <section className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Cara Kerja Sistem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <StepCard number="1" title="Daftar Akun" desc="Buat akun di Gerbang Beasiswa." />
            <StepCard number="2" title="Lengkapi Profil" desc="Input IPK, Penghasilan Ortu, Domisili." />
            <StepCard number="3" title="Analisis Sistem" desc="Algoritma menghitung nilai kedekatan profil." />
            <StepCard number="4" title="Dapatkan Hasil" desc="Lihat daftar beasiswa yang paling relevan." />
          </div>
        </div>
      </section>

      {/* 4. RECENT POSTS: Data Beasiswa Terbaru */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end border-b pb-4">
               <div>
                  <h2 className="text-3xl font-bold text-blue-900">Beasiswa Terbaru</h2>
                  <p className="text-gray-500 mt-2">Peluang terbaru yang baru saja dibuka.</p>
               </div>
               <Link to={"/search"} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                 Lihat Semua <ArrowRight className="h-4 w-4" />
               </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            
            <div className="text-center mt-8">
               <Link to={"/search"}>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Telusuri Arsip Beasiswa
                </Button>
               </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Komponen Kartu Fitur
const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center">
      <div className="mb-6 p-4 bg-gray-50 rounded-full">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

// Komponen Langkah-langkah
const StepCard = ({ number, title, desc }) => {
    return (
        <div className="relative p-6 bg-white rounded-lg shadow-sm">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {number}
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{desc}</p>
        </div>
    )
}

export default Home