import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { 
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutSuccess,
  updateFailure,
  updateStart,
  updateSuccess,
} from '@/redux/user/userSlice'
import { getFilePreview, uploadFile } from '@/lib/appwrite/uploadImage'
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { 
  BookOpen, DollarSign, GraduationCap, User, Mail, Lock, Save, Camera, MapPin, Target, Pencil, X 
} from 'lucide-react' 

const DashboardProfile = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user)

  const profilePicRef = useRef()
  const dispatch = useDispatch()
  const { toast } = useToast()

  const [imageFile, setImageFile] = useState(null)
  const [imageFileUrl, setImageFileUrl] = useState(null)
  const [formData, setFormData] = useState({})
  
  // STATE BARU: Mode Edit
  const [isEditing, setIsEditing] = useState(false)

  // Handle perubahan input text/number
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  // Handle perubahan gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if(file){
      setImageFile(file)
      setImageFileUrl(URL.createObjectURL(file))
    }
  }

  // Upload gambar ke Appwrite
  const uploadImage = async() => {
    if(!imageFile) return currentUser.profilePicture

    try {
      const uploadedFile = await uploadFile(imageFile)
      const profilePictureUrl = getFilePreview(uploadedFile.$id)
      return profilePictureUrl
    } catch (error) {
      toast({ title: "Gagal mengunggah gambar. Silakan coba lagi!" })
      console.log("Image upload failed: ", error);
    }
  }

  // Submit Form Utama
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      dispatch(updateStart())

      // Tunggu upload gambar selesai (jika ada)
      const profilePicture = await uploadImage()

      // Gabungkan data form + url gambar baru
      const updateProfile = {
        ...formData,
        profilePicture,
      }

      // Kirim ke Backend
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateProfile)
      })

      const data = await res.json()

      if(data.success === false) {
        toast({ title: "Update gagal.", description: data.message })
        dispatch(updateFailure(data.message))
      } else {
        dispatch(updateSuccess(data))
        toast({ title: "Profil berhasil diperbarui!", description: "Data Anda siap digunakan untuk analisis beasiswa." })
        setIsEditing(false) // Kembali ke mode baca setelah sukses
      }
    } catch (error) {
      toast({ title: "Terjadi kesalahan sistem." })
      dispatch(updateFailure(error.message))
    }
  }

  // Hapus User
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: "DELETE" })
      const data = await res.json()

      if (!res.ok) {
        dispatch(deleteUserFailure(data.message))
      } else {
        dispatch(deleteUserSuccess())
      }
    } catch (error) {
      console.log(error)
      dispatch(deleteUserFailure(error.message))
    }
  }

  // Sign Out
  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        console.log(data.message)
      } else {
        dispatch(signOutSuccess())
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 w-full pb-20 font-sans">
      
      {/* Header Halaman */}
      <div className="mb-8 border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Pengaturan Profil</h1>
            <p className="text-slate-500 mt-1">Lengkapi data diri Anda untuk mendapatkan rekomendasi beasiswa yang akurat.</p>
        </div>
        
        {/* Indikator Mode */}
        <div className={`mt-4 md:mt-0 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isEditing ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
            {isEditing ? "Mode Edit Aktif" : "Mode Baca"}
        </div>
      </div>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* --- KOLOM KIRI: FOTO & AKUN --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Card Foto */}
                <div className={`flex flex-col items-center p-6 bg-white border rounded-2xl shadow-sm transition-all ${isEditing ? "border-blue-300 ring-2 ring-blue-50" : "border-slate-200"}`}>
                    <input 
                        type="file" accept="image/*" hidden ref={profilePicRef} onChange={handleImageChange}
                        disabled={!isEditing} // Disable jika tidak edit
                    />
                    <div 
                        className={`relative w-36 h-36 group ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                        onClick={() => isEditing && profilePicRef.current.click()}
                    >
                        <img
                            src={imageFileUrl || currentUser.profilePicture}
                            alt="profile"
                            className={`rounded-full w-full h-full object-cover border-4 shadow-md transition duration-300 ${isEditing ? "border-blue-100 group-hover:opacity-75" : "border-slate-50 grayscale-[10%]"}`}
                        />
                        {/* Icon kamera hanya muncul saat mode edit */}
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <Camera className="text-slate-800 drop-shadow-md" size={32} />
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-4">Foto Profil</p>
                    {isEditing && <span className="text-xs text-blue-500">Klik gambar untuk mengganti</span>}
                </div>

                {/* Info Akun Dasar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 mb-2">Informasi Akun</h3>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><User size={12}/> Username</label>
                        <Input 
                            type="text" id="username" 
                            defaultValue={currentUser.username} 
                            onChange={handleChange} 
                            className={`transition-colors ${isEditing ? "bg-white border-blue-300" : "bg-slate-100 border-transparent cursor-not-allowed"}`}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><Mail size={12}/> Email</label>
                        <Input type="email" id="email" defaultValue={currentUser.email} disabled className="bg-slate-100 text-slate-500 cursor-not-allowed border-transparent" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><Lock size={12}/> Password Baru</label>
                        <Input 
                            type="password" id="password" placeholder="********" 
                            onChange={handleChange} 
                            className={`transition-colors ${isEditing ? "bg-white border-blue-300" : "bg-slate-100 border-transparent cursor-not-allowed"}`}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </div>


            {/* --- KOLOM KANAN: DATA BEASISWA (5 ATRIBUT) --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Hanya Tampil untuk User Biasa (Bukan Admin) */}
                {!currentUser.isAdmin && (
                    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        
                        <div className="flex items-start gap-4 mb-8 border-b border-blue-100 pb-6">
                            <div className="bg-blue-100 p-3 rounded-full hidden md:block">
                                <GraduationCap className="text-blue-700" size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900 text-xl">Data Penunjang Skripsi</h3>
                                <p className="text-blue-600/80 text-sm mt-1 leading-relaxed">
                                    Sistem rekomendasi Euclidean Distance membutuhkan 5 data di bawah ini untuk menghitung peluang kelolosan Anda.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* 1. JENJANG PENDIDIKAN */}
                            <div className="space-y-2">
                                <label htmlFor="educationLevel" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <GraduationCap size={16} className="text-blue-500"/> Jenjang Pendidikan
                                </label>
                                <select
                                    id="educationLevel"
                                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition 
                                        ${isEditing ? "bg-white border-blue-300" : "bg-slate-100 border-transparent cursor-not-allowed text-slate-600 appearance-none"}`}
                                    defaultValue={currentUser.educationLevel || 'Umum'}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                >
                                    <option value="Umum" disabled>Pilih Jenjang...</option>
                                    <option value="SMA">SMA / SMK / MA</option>
                                    <option value="D3">D3 (Diploma)</option>
                                    <option value="S1">S1 (Sarjana)</option>
                                    <option value="S2">S2 (Magister)</option>
                                </select>
                            </div>

                            {/* 2. JURUSAN */}
                            <div className="space-y-2">
                                <label htmlFor="major" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <BookOpen size={16} className="text-blue-500"/> Jurusan / Prodi
                                </label>
                                <Input
                                    type="text" id="major" placeholder="Cth: Informatika, Hukum, IPA, IP"
                                    defaultValue={currentUser.major || ''} onChange={handleChange} 
                                    className={`transition-colors ${isEditing ? "bg-white border-blue-300" : "bg-slate-100 border-transparent cursor-not-allowed"}`}
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* 3. IPK / Nilai Rata-rata */}
<div className="space-y-2">
    <label htmlFor="gpa" className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <Target size={16} className="text-blue-500"/> IPK / Nilai Rata-rata
    </label>
    
    <Input
        type="number" 
        id="gpa" 
        // CHT (CONTOH) DITUNJUKKAN DI SINI
        placeholder="Cth: 3.85 atau 85.5" 
        // PENTING: step="0.01" agar bisa input desimal (koma)
        step="0.01"
        defaultValue={currentUser.gpa || ''} 
        onChange={handleChange} 
        className={`transition-colors ${isEditing ? "bg-white border-blue-300" : "bg-slate-100 border-transparent cursor-not-allowed"}`}
        disabled={!isEditing}
    />
    
    {/* TEKS BANTUAN TAMBAHAN */}
    {isEditing && (
        <div className="flex flex-col gap-1">
            <p className="text-[11px] text-slate-500">
                ℹ️ Gunakan tanda <b>titik (.)</b> sebagai pemisah desimal.
            </p>
            <p className="text-[10px] text-slate-400 italic">
                Contoh: Ketik <b>3.50</b> (bukan 3,50) atau <b>85.5</b> (untuk skala 100).
            </p>
        </div>
    )}
</div>

                            {/* 4. DOMISILI */}
                            <div className="space-y-2">
                                <label htmlFor="location" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-500"/> Domisili (Kota)
                                </label>
                                <Input
                                    type="text" id="location" placeholder="Cth: Malang, Jakarta"
                                    defaultValue={currentUser.location || ''} onChange={handleChange} 
                                    className={`transition-colors ${isEditing ? "bg-white border-blue-300" : "bg-slate-100 border-transparent cursor-not-allowed"}`}
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* 5. EKONOMI */}
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="income" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <DollarSign size={16} className="text-blue-500"/> Penghasilan Orang Tua (Per Bulan)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">Rp</span>
                                    <Input
                                        type="number" id="income" placeholder="3000000"
                                        defaultValue={currentUser.income || ''} onChange={handleChange} 
                                        className={`pl-10 transition-colors ${isEditing ? "bg-white border-blue-300" : "bg-slate-100 border-transparent cursor-not-allowed"}`}
                                        disabled={!isEditing}
                                    />
                                </div>
                                {isEditing && <p className="text-[10px] text-slate-400">Tulis angka saja tanpa titik/koma.</p>}
                            </div>

                        </div>
                    </div>
                )}

                {/* --- TOMBOL AKSI (EDIT / SAVE / CANCEL) --- */}
                <div className="flex flex-col gap-3">
                    {!isEditing ? (
                        // 1. TAMPILAN AWAL: Tombol Edit
                        <Button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsEditing(true);
                            }}
                            className="w-full h-12 bg-white text-blue-900 border-2 border-blue-900 hover:bg-blue-50 font-bold text-md shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Pencil size={18} /> Edit Profil
                        </Button>
                    ) : (
                        // 2. TAMPILAN EDIT: Tombol Simpan & Batal
                        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <Button 
                                type="button" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsEditing(false);
                                    setFormData({}); // Reset perubahan sementara
                                }}
                                className="flex-1 h-12 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold text-md flex items-center justify-center gap-2"
                            >
                                <X size={18} /> Batal
                            </Button>

                            <Button 
                                type="submit" 
                                className="flex-[2] h-12 bg-blue-900 hover:bg-blue-800 text-white font-bold text-md shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2" 
                                disabled={loading}
                            >
                                <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    )}
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">{error}</div>}
            </div>

        </div>
      </form>

      {/* --- DELETE & LOGOUT --- */}
      <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">Hapus Akun Permanen</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
              <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Data Anda akan hilang permanen.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUser}>Ya, Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="outline" className="text-slate-600 border-slate-300" onClick={handleSignout}>Keluar (Sign Out)</Button>
      </div>

    </div>
  )
}

export default DashboardProfile