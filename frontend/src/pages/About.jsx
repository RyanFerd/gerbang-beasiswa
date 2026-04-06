import React from "react"
import { Github, Linkedin, Mail } from "lucide-react" // Pastikan install lucide-react

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. HEADER SECTION: Identitas Aplikasi */}
      <div className="bg-blue-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Tentang <span className="text-yellow-400">Gerbang Beasiswa</span>
        </h1>
        <p className="text-blue-100 max-w-2xl mx-auto text-lg leading-relaxed">
          Sebuah inisiatif teknologi untuk mendemokratisasi akses informasi pendidikan melalui penerapan algoritma sistem rekomendasi cerdas.
        </p>
      </div>

      {/* 2. CONTENT SECTION: Penjelasan Skripsi/Project */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 relative inline-block">
              Latar Belakang Pengembangan
              {/* Garis bawah kuning */}
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-yellow-400 rounded-full"></span>
            </h2>

            <div className="space-y-4 text-gray-600 leading-relaxed text-justify">
              <p>
                <strong>Gerbang Beasiswa</strong> dirancang sebagai solusi atas permasalahan "Information Overload" yang sering dialami mahasiswa saat mencari bantuan biaya pendidikan. Banyaknya opsi beasiswa seringkali justru membuat bingung, bukan membantu.
              </p>
              <p>
                Sistem ini merupakan hasil penelitian Tugas Akhir yang mengimplementasikan metode <strong>Content-Based Filtering</strong> dengan algoritma <strong>Euclidean Distance</strong>.
              </p>
              <p>
                Tujuannya bukan hanya menampilkan data, tetapi menghitung tingkat kecocokan (relevansi) antara profil akademik & ekonomi mahasiswa dengan persyaratan beasiswa secara presisi.
              </p>
            </div>
          </div>

          {/* Right: Image (Suasana Akademis/Riset) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Research & Development"
              className="relative rounded-2xl shadow-xl w-full object-cover transform transition duration-500 hover:scale-[1.01]"
            />
          </div>
        </div>
      </div>

      {/* 3. DEVELOPER SECTION: Personal Branding Anda */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            Pengembang Sistem
          </h2>

          {/* Profile Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row items-center gap-8 border border-gray-100">
            
            {/* Foto Profil */}
            <div className="shrink-0 relative">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-900 shadow-md">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Ganti dengan foto asli Anda nanti!
                  alt="Ryan Ferdiansyah"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-yellow-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                Developer
              </div>
            </div>

            {/* Info Profil */}
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold text-blue-900 mb-1">
                Ryan Ferdiansyah
              </h3>
              <p className="text-yellow-600 font-medium mb-4">
                Mahasiswa Teknik Informatika
              </p>
              
              <p className="text-gray-500 mb-6 italic">
                "Berdedikasi untuk mengembangkan solusi perangkat lunak yang tidak hanya fungsional, tetapi juga memberikan dampak nyata bagi efisiensi pencarian informasi pendidikan di Indonesia."
              </p>

              {/* Social Links (Opsional - Keren buat portofolio) */}
              <div className="flex gap-4">
                <SocialButton icon={<Github size={20} />} label="Github" />
                <SocialButton icon={<Linkedin size={20} />} label="LinkedIn" />
                <SocialButton icon={<Mail size={20} />} label="Email" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TECH STACK (Bonus: Biar Dosen Tahu Anda Pakai Teknologi Modern) */}
      <div className="py-12 border-t border-gray-200">
        <p className="text-center text-gray-400 font-medium mb-6 uppercase tracking-widest text-sm">
          Dibangun Menggunakan Teknologi
        </p>
        <div className="flex justify-center gap-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Anda bisa ganti src ini dengan logo React, MongoDB, Tailwind, dll */}
            <TechIcon name="MERN Stack" />
            <TechIcon name="Euclidean Algorithm" />
            <TechIcon name="Tailwind CSS" />
        </div>
      </div>

    </div>
  )
}

// Komponen Kecil untuk Tombol Sosmed
const SocialButton = ({ icon, label }) => (
  <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-blue-900 hover:text-white transition-colors duration-300" title={label}>
    {icon}
  </button>
)

// Komponen Text Tech
const TechIcon = ({ name }) => (
    <span className="font-bold text-gray-400 text-xl">{name}</span>
)

export default About