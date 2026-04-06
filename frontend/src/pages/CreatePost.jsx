import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getFilePreview, uploadFile } from "@/lib/appwrite/uploadImage"
import React, { useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux" 
// Tambahkan ExternalLink di import icon
import { Target, BookOpen, MapPin, DollarSign, GraduationCap, Info, CalendarClock, ExternalLink } from "lucide-react"

const CreatePost = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user)

  const [file, setFile] = useState(null)
  const [imageUploadError, setImageUploadError] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  
  const [formData, setFormData] = useState({
      criteriaEducationLevel: []
  })
  const [createPostError, setCreatePostError] = useState(null)

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Mohon pilih gambar terlebih dahulu!")
        toast({ title: "Mohon pilih gambar terlebih dahulu!" })
        return
      }
      setImageUploading(true)
      setImageUploadError(null)

      const uploadedFile = await uploadFile(file)
      const postImageUrl = getFilePreview(uploadedFile.$id)

      setFormData({ ...formData, image: postImageUrl })
      toast({ title: "Gambar berhasil diunggah!" })
      setImageUploading(false)
    } catch (error) {
      setImageUploadError("Gagal mengunggah gambar")
      console.log(error)
      toast({ title: "Gagal mengunggah gambar!" })
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // --- VALIDASI TANGGAL ---
    if (formData.startDate && formData.deadline) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.deadline);
        if (end < start) {
            setCreatePostError("Tanggal penutupan tidak boleh lebih awal dari tanggal dibuka.");
            toast({ title: "Cek kembali tanggal pendaftaran!", variant: "destructive" });
            return;
        }
    }

    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Terjadi kesalahan! Silakan coba lagi." })
        setCreatePostError(data.message)
        return
      }
      
      if (res.ok) {
        setCreatePostError(null)
        if (currentUser.isAdmin) {
            toast({ title: "Artikel Berhasil Diterbitkan!" })
            navigate(`/post/${data.slug}`)
        } else {
            toast({ 
                title: "Artikel Terkirim!", 
                description: "Artikel Anda sedang ditinjau oleh Admin sebelum ditayangkan." 
            })
            navigate('/dashboard?tab=posts')
        }
      }

    } catch (error) {
      toast({ title: "Terjadi kesalahan! Silakan coba lagi." })
      setCreatePostError("Terjadi kesalahan sistem.")
    }
  }

  const handleChange = (e) => {
       setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleJenjangChange = (e) => {
      const { value, checked } = e.target;
      const currentLevels = formData.criteriaEducationLevel || [];

      if (checked) {
          setFormData({ ...formData, criteriaEducationLevel: [...currentLevels, value] });
      } else {
          setFormData({
              ...formData,
              criteriaEducationLevel: currentLevels.filter((level) => level !== value),
          });
      }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto min-h-screen pb-20">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Buat Artikel Beasiswa
      </h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        
        {/* --- BAGIAN 1: JUDUL & KATEGORI --- */}
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <Input
            type="text"
            placeholder="Judul Artikel / Nama Beasiswa"
            required
            id="title"
            className="w-full sm:w-3/4 h-12 border border-slate-400 focus-visible:ring-0"
            onChange={handleChange}
          />

          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="w-full sm:w-1/4 h-12 border border-slate-400 focus-visible:ring-0">
              <SelectValue placeholder="Kategori Artikel" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Jenis Postingan</SelectLabel>
                <SelectItem value="beasiswa">Info Beasiswa</SelectItem>
                <SelectItem value="edukasi">Edukasi & Tips</SelectItem>
                <SelectItem value="event">Event & Lomba</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* --- BAGIAN 2: GAMBAR --- */}
        <div className="flex gap-4 items-center justify-between border-4 border-slate-600 border-dotted p-3 rounded-lg">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="border-none shadow-none"
          />
          <Button
            type="button"
            className="bg-slate-700 hover:bg-slate-600"
            onClick={handleUploadImage}
            disabled={imageUploading}
          >
            {imageUploading ? "Mengunggah..." : "Upload Cover"}
          </Button>
        </div>
        
        {imageUploadError && <p className="text-red-600 text-sm text-center">{imageUploadError}</p>}
        {formData.image && (
          <img
            src={formData.image}
            alt="upload"
            className="w-full h-72 object-cover rounded-lg shadow-sm"
          />
        )}

        {/* --- BAGIAN 3: FILTERING KRITERIA --- */}
         <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-700" />
                <h3 className="text-lg font-bold text-blue-900">Filter & Kriteria Pendaftar</h3>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* 1. Jenjang */}
                 <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">1. Target Jenjang (Bisa pilih &gt; 1)</label>
                    <div className="bg-white border border-blue-300 p-3 rounded-md grid grid-cols-2 gap-2">
                        {['SMA', 'Diploma', 'S1', 'Pascasarjana'].map((jenjang) => (
                            <div key={jenjang} className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id={`jenjang-${jenjang}`} 
                                    value={jenjang}
                                    onChange={handleJenjangChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`jenjang-${jenjang}`} className="text-sm text-slate-700 font-medium cursor-pointer">
                                    {jenjang === 'SMA' ? 'SMA/Sederajat' : jenjang === 'Diploma' ? 'Diploma (D3/D4)' : jenjang === 'S1' ? 'Sarjana (S1)' : 'Pascasarjana (S2/S3)'}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* 2. Jurusan */}
                 <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">2. Khusus Jurusan</label>
                    <div className="relative">
                        <Input type="text" id="criteriaMajor" placeholder="Contoh: Teknik Informatika" className="bg-white border-blue-300 pl-9" onChange={handleChange} />
                        <BookOpen size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                 {/* 3. IPK */}
                 <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">3. Minimal IPK / Nilai</label>
                    <div className="relative">
                        <Input type="number" id="criteriaMinGPA" placeholder="Contoh: 3.50" step="0.01" className="bg-white border-blue-300 pl-9" onChange={handleChange} />
                        <GraduationCap size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                 {/* 4. Lokasi */}
                 <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">4. Lokasi / Daerah</label>
                    <div className="relative">
                        <Input type="text" id="criteriaLocation" placeholder="Contoh: Jawa Timur" className="bg-white border-blue-300 pl-9" onChange={handleChange} />
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                 {/* 5. Income */}
                 <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">5. Maksimal Penghasilan Ortu</label>
                    <div className="relative">
                        <Input type="number" id="criteriaMaxIncome" placeholder="Contoh: 5000000" className="bg-white border-blue-300 pl-9" onChange={handleChange} />
                        <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>
             </div>
         </div>

        {/* --- BAGIAN 4: CONTENT EDITOR --- */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Isi Konten Artikel</label>
            <ReactQuill
                theme="snow"
                placeholder="Tulis detail lengkap di sini..."
                className="h-72 mb-12 bg-white" 
                required
                onChange={(value) => {
                    setFormData({ ...formData, content: value })
                }}
            />
        </div>

        {/* --- BAGIAN 5: PERIODE PENDAFTARAN --- */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-20"> 
            <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="text-slate-600" />
                <h3 className="font-semibold text-slate-700">Periode Pendaftaran</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TANGGAL DIBUKA */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">
                        Tanggal Dibuka (Open Registration)
                    </label>
                    <Input 
                        type="date" 
                        id="startDate"
                        className="bg-white border-slate-300"
                        onChange={handleChange}
                    />
                </div>

                {/* TANGGAL DITUTUP (DEADLINE) */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">
                        Tanggal Ditutup (Deadline)
                    </label>
                    <Input 
                        type="date" 
                        id="deadline"
                        className="bg-white border-slate-300"
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>

        {/* --- BAGIAN 6 (BARU): LINK SUMBER RESMI --- */}
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mt-2"> 
            <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="text-teal-700" size={20} />
                <h3 className="font-semibold text-teal-800">Tautan Pendaftaran Asli</h3>
            </div>
            
            <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    Link Website Resmi / Formulir Pendaftaran
                </label>
                <Input 
                    type="url" 
                    id="officialLink" // Pastikan backend model Anda menerima field 'officialLink'
                    placeholder="Contoh: https://beasiswamekar.com/daftar atau https://forms.gle/..."
                    className="bg-white border-teal-300 text-slate-700"
                    onChange={handleChange}
                />
                <p className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
                    <Info size={12}/> 
                    Pengguna akan diarahkan ke link ini jika mereka cocok dengan kriteria.
                </p>
            </div>
        </div>

        {/* INFORMASI TAMBAHAN */}
        {!currentUser.isAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded flex gap-2 items-start mt-6">
                <Info className="text-yellow-600 mt-1 flex-shrink-0" size={18} />
                <p className="text-sm text-yellow-700">
                    <strong>Catatan Kontributor:</strong> Artikel Anda tidak akan langsung tayang. 
                    Admin akan meninjau konten Anda terlebih dahulu. Cek status di Dashboard.
                </p>
            </div>
        )}

        <Button
          type="submit"
          className="h-14 bg-green-600 hover:bg-green-700 font-bold text-lg shadow-lg mt-4"
        >
          {currentUser.isAdmin ? "Terbitkan Artikel" : "Kirim untuk Ditinjau"}
        </Button>

        {createPostError && (
          <p className="text-red-600 mt-5 text-center bg-red-50 p-3 rounded">{createPostError}</p>
        )}
      </form>
    </div>
  )
}

export default CreatePost