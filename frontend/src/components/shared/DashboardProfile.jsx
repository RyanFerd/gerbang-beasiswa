import React, { useRef, useState, useEffect } from 'react'
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
  BookOpen, GraduationCap, User, Mail, Lock, Save, Camera, Target, Pencil, X 
} from 'lucide-react' 

const DashboardProfile = () => {
  const { currentUser, error, loading } = useSelector((state) => state.user)

  const profilePicRef = useRef()
  const dispatch = useDispatch()
  const { toast } = useToast()

  const [imageFile, setImageFile] = useState(null)
  const [imageFileUrl, setImageFileUrl] = useState(null)
  const [formData, setFormData] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if(file){
      setImageFile(file)
      setImageFileUrl(URL.createObjectURL(file))
    }
  }

  const uploadImage = async() => {
    if(!imageFile) return currentUser.profilePicture
    try {
      const uploadedFile = await uploadFile(imageFile)
      const profilePictureUrl = getFilePreview(uploadedFile.$id)
      return profilePictureUrl
    } catch (error) {
      toast({ title: "Gagal mengunggah gambar." })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      dispatch(updateStart())
      const profilePicture = await uploadImage()
      const updateProfile = { ...formData, profilePicture }

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateProfile)
      })

      const data = await res.json()
      if(data.success === false) {
        dispatch(updateFailure(data.message))
        toast({ title: "Update gagal.", description: data.message, variant: "destructive" })
      } else {
        dispatch(updateSuccess(data))
        toast({ title: "Profil diperbarui!" })
        setIsEditing(false)
        setFormData({}) 
      }
    } catch (error) {
      dispatch(updateFailure(error.message))
    }
  }

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
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", { method: "POST" })
      if (res.ok) dispatch(signOutSuccess())
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 w-full pb-20 font-sans">
      
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Pengaturan Profil</h1>
            <p className="text-slate-500 mt-1">Kelola informasi akun dan data penunjang Anda.</p>
        </div>
        <div className={`mt-4 md:mt-0 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isEditing ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
            {isEditing ? "Mode Edit Aktif" : "Mode Baca"}
        </div>
      </div>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* KOLOM KIRI: FOTO & AKUN */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className={`flex flex-col items-center p-6 bg-white border rounded-2xl shadow-sm transition-all ${isEditing ? "border-blue-300 ring-2 ring-blue-50" : "border-slate-200"}`}>
                    <input type="file" accept="image/*" hidden ref={profilePicRef} onChange={handleImageChange} disabled={!isEditing} />
                    <div className={`relative w-36 h-36 group ${isEditing ? "cursor-pointer" : "cursor-default"}`} onClick={() => isEditing && profilePicRef.current.click()}>
                        <img src={imageFileUrl || currentUser.profilePicture} alt="profile" className={`rounded-full w-full h-full object-cover border-4 shadow-md transition duration-300 ${isEditing ? "border-blue-100 group-hover:opacity-75" : "border-slate-50"}`} />
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                <Camera className="text-slate-800" size={32} />
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-4">Foto Profil</p>
                    {isEditing && <span className="text-xs text-blue-500">Klik gambar untuk mengganti</span>}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 mb-2">Informasi Akun</h3>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><User size={12}/> Username</label>
                        <Input id="username" defaultValue={currentUser.username} onChange={handleChange} disabled={!isEditing} className={isEditing ? "border-blue-300" : "bg-slate-100"} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Mail size={12}/> Email</label>
                        <Input defaultValue={currentUser.email} disabled className="bg-slate-100 text-slate-400" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Lock size={12}/> Password Baru</label>
                        <Input 
                            type="password" 
                            id="password" 
                            placeholder="********" 
                            onChange={handleChange} 
                            disabled={!isEditing} 
                            className={isEditing ? "border-blue-300 bg-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"} 
                        />
                    </div>
                </div>
            </div>

            {/* KOLOM KANAN: DATA DINAMIS */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. DATA MAHASISWA (Hanya tampil jika BUKAN Mitra dan BUKAN Admin) */}
                {!currentUser.isUserContributor && !currentUser.isAdmin && (
                    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-start gap-4 mb-8 border-b border-blue-100 pb-6">
                            <GraduationCap className="text-blue-700 hidden md:block" size={28} />
                            <div>
                                <h3 className="font-bold text-blue-900 text-xl">Data Penunjang Beasiswa</h3>
                                <p className="text-blue-600/80 text-sm mt-1">Lengkapi data untuk perhitungan rekomendasi.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Jenjang</label>
                                <select id="educationLevel" onChange={handleChange} defaultValue={currentUser.educationLevel || ''} disabled={!isEditing} className={`w-full h-10 rounded-md border px-3 text-sm ${isEditing ? "border-blue-300" : "bg-slate-100"}`}>
                                    <option value="">Pilih Jenjang...</option>
                                    <option value="SMA">SMA/SMK</option>
                                    <option value="D3">D3</option>
                                    <option value="S1">S1</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">IPK / Nilai</label>
                                <Input type="number" step="0.01" id="gpa" defaultValue={currentUser.gpa} onChange={handleChange} disabled={!isEditing} className={isEditing ? "border-blue-300" : "bg-slate-100"} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Penghasilan Orang Tua</label>
                                <Input type="number" id="income" defaultValue={currentUser.income} onChange={handleChange} disabled={!isEditing} className={isEditing ? "border-blue-300" : "bg-slate-100"} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. DATA INSTITUSI (Hanya tampil jika Mitra/Contributor atau Admin) */}
                {(currentUser.isUserContributor || currentUser.isAdmin) && (
                    <div className="space-y-6">
                        
                        {/* BANNER PERINGATAN JIKA PROFIL BELUM LENGKAP */}
                        {!currentUser.organizationName && (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
                            <Target className="text-amber-600 shrink-0" size={24} />
                            <div>
                              <p className="text-sm font-bold text-amber-900">Aksi Diperlukan: Lengkapi Profil Institusi</p>
                              <p className="text-xs text-amber-700">Anda tidak dapat membuat artikel beasiswa sebelum mengisi Nama Organisasi.</p>
                            </div>
                          </div>
                        )}

                        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-2xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-start gap-4 mb-8 border-b border-indigo-100 pb-6">
                                <BookOpen className="text-indigo-700 hidden md:block" size={28} />
                                <div>
                                    <h3 className="font-bold text-indigo-900 text-xl">Profil Institusi / Organisasi</h3>
                                    <p className="text-indigo-600/80 text-sm mt-1">Identitas penyelenggara yang akan tampil di artikel.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Nama Organisasi <span className="text-red-500">*</span></label>
                                    <Input 
                                        id="organizationName" 
                                        defaultValue={currentUser.organizationName} 
                                        onChange={handleChange} 
                                        placeholder="Contoh: Universitas Gadjah Mada" 
                                        disabled={!isEditing} 
                                        required={isEditing} 
                                        className={isEditing ? "border-indigo-300 bg-white" : "bg-slate-100"} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Website Resmi</label>
                                    <Input 
                                        id="website" 
                                        defaultValue={currentUser.website} 
                                        onChange={handleChange} 
                                        placeholder="https://..." 
                                        disabled={!isEditing} 
                                        className={isEditing ? "border-indigo-300 bg-white" : "bg-slate-100"} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOMBOL AKSI */}
                <div className="flex flex-col gap-3 pt-4">
                    {!isEditing ? (
                        <Button type="button" onClick={() => setIsEditing(true)} className="w-full h-12 bg-white text-blue-900 border-2 border-blue-900 hover:bg-blue-50 font-bold flex items-center justify-center gap-2">
                            <Pencil size={18} /> Edit Profil
                        </Button>
                    ) : (
                        <div className="flex gap-4">
                            <Button type="button" onClick={() => { setIsEditing(false); setFormData({}); }} className="flex-1 h-12 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold">
                                <X size={18} className="mr-2 inline" /> Batal
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-[2] h-12 bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-lg flex items-center justify-center gap-2">
                                <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-red-500 hover:bg-red-50">Hapus Akun Permanen</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
              <AlertDialogDescription>Semua data Anda akan hilang secara permanen.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUser}>Ya, Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" className="text-slate-600" onClick={handleSignout}>Keluar (Sign Out)</Button>
      </div>
    </div>
  )
}

export default DashboardProfile