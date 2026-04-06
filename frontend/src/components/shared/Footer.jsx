import React from "react"
import { Link } from "react-router-dom"
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, GraduationCap } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* KOLOM 1: Branding & Deskripsi Singkat */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-2xl">
            <GraduationCap className="h-8 w-8 text-yellow-400" />
            <span>Gerbang Beasiswa</span>
          </Link>
          
          <p className="text-slate-400 text-sm leading-relaxed text-justify">
            Sistem rekomendasi beasiswa berbasis web yang dikembangkan sebagai bagian dari penelitian Tugas Akhir. 
            Menggunakan algoritma <i>Euclidean Distance</i> untuk membantu mahasiswa menemukan bantuan pendidikan yang paling relevan.
          </p>
        </div>

        {/* KOLOM 2: Navigasi Cepat */}
        <div>
          <h2 className="text-white text-lg font-bold mb-6 border-l-4 border-yellow-400 pl-3">
            Akses Cepat
          </h2>

          <ul className="space-y-3 text-sm">
            <li>
              <Link to={"/"} className="hover:text-yellow-400 transition-colors duration-200 block w-fit">
                Beranda
              </Link>
            </li>

            <li>
              <Link to={"/dashboard"} className="hover:text-yellow-400 transition-colors duration-200 block w-fit">
                Cari Rekomendasi (Dashboard)
              </Link>
            </li>

            <li>
              <Link to={"/search"} className="hover:text-yellow-400 transition-colors duration-200 block w-fit">
                Daftar Semua Beasiswa
              </Link>
            </li>

            <li>
              <Link to={"/about"} className="hover:text-yellow-400 transition-colors duration-200 block w-fit">
                Tentang Pengembang
              </Link>
            </li>
          </ul>
        </div>

        {/* KOLOM 3: Kontak & Akademik */}
        <div>
          <h2 className="text-white text-lg font-bold mb-6 border-l-4 border-yellow-400 pl-3">
            Kontak & Kampus
          </h2>

          <div className="space-y-4 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p>
                Fakultas Teknik Informatika,<br />
                Universitas Negeri Surabaya,<br />
                Kota Surabaya, Indonesia.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-yellow-500 shrink-0" />
              <a href="mailto:ryan@student.university.ac.id" className="hover:text-white">
                ryan21073@mhs.unesa.ac.id
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM: Copyright & Socials */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} <span className="text-slate-300">Gerbang Beasiswa</span>. Developed by Ryan Ferdiansyah.
        </p>

        <div className="flex gap-4">
          <SocialIcon icon={<Facebook size={18} />} link="#" />
          <SocialIcon icon={<Twitter size={18} />} link="#" />
          <SocialIcon icon={<Linkedin size={18} />} link="#" />
          <SocialIcon icon={<Instagram size={18} />} link="#" />
        </div>
      </div>
    </footer>
  )
}

// Komponen Kecil untuk Ikon Sosmed
const SocialIcon = ({ icon, link }) => (
  <a 
    href={link} 
    className="bg-slate-800 p-2 rounded-full text-slate-400 hover:bg-yellow-400 hover:text-slate-900 transition-all duration-300"
  >
    {icon}
  </a>
)

export default Footer