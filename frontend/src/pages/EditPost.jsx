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
import React, { useEffect, useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
// Import Icon (Tambahkan ExternalLink)
import { Target, BookOpen, MapPin, DollarSign, GraduationCap, Calendar, Loader2, ExternalLink } from "lucide-react"

const EditPost = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { postId } = useParams()

  const { currentUser } = useSelector((state) => state.user)

  const [file, setFile] = useState(null)
  const [imageUploadError, setImageUploadError] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  
  // State Loading untuk Data Awal
  const [isLoadingData, setIsLoadingData] = useState(true)

  // State awal (Tambahkan officialLink)
  const [formData, setFormData] = useState({
      title: '',
      category: '',
      content: '',
      image: '',
      officialLink: '', // UPDATE: Menambahkan field link
      criteriaEducationLevel: [],
      criteriaMajor: '',
      criteriaMinGPA: '',
      criteriaLocation: '',
      criteriaMaxIncome: '',
      startDate: '',
      deadline: ''
  })
  const [updatePostError, setUpdatePostError] = useState(null)

  // 1. Fetch Data Postingan Lama
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoadingData(true); 
        const res = await fetch(`/api/post/getposts?postId=${postId}`)
        const data = await res.json()

        if (!res.ok) {
          console.log(data.message)
          setUpdatePostError(data.message)
          setIsLoadingData(false);
          return
        }

        if (res.ok) {
          setUpdatePostError(null)
          
          const fetchedData = data.posts[0];

          // --- PERBAIKAN LOGIC FORMATTING ---
          
          // 1. Format Deadline (YYYY-MM-DD)
          let formattedDeadline = '';
          if (fetchedData.deadline) {
            formattedDeadline = new Date(fetchedData.deadline).toISOString().split('T')[0];
          }

          // 2. Format Start Date (YYYY-MM-DD)
          let formattedStartDate = '';
          if (fetchedData.startDate) {
            formattedStartDate = new Date(fetchedData.startDate).toISOString().split('T')[0];
          }

          // 3. Format Array Jenjang
          let formattedLevels = [];
          if (Array.isArray(fetchedData.criteriaEducationLevel)) {
             formattedLevels = fetchedData.criteriaEducationLevel;
          } else if (fetchedData.criteriaEducationLevel) {
             formattedLevels = [fetchedData.criteriaEducationLevel];
          }

          // 4. Set State (officialLink otomatis masuk via ...fetchedData jika ada di DB)
          setFormData({
             ...fetchedData, 
             deadline: formattedDeadline,
             startDate: formattedStartDate,
             criteriaEducationLevel: formattedLevels,
             category: fetchedData.category ? fetchedData.category.toLowerCase() : '',
             officialLink: fetchedData.officialLink || '' // Fallback jika kosong
          });
        }
      } catch (error) {
        console.log(error.message)
      } finally {
        setIsLoadingData(false);
      }
    }

    if (postId) {
        fetchPost()
    }
  }, [postId])

  // 2. Fungsi Upload Gambar
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

      if (postImageUrl) {
        setImageUploading(false)
      }
    } catch (error) {
      setImageUploadError("Gagal mengunggah gambar")
      console.log(error)
      toast({ title: "Gagal mengunggah gambar!" })
      setImageUploading(false)
    }
  }

  // 3. Fungsi Submit (Update Data)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData._id || !currentUser?._id) {
        toast({ title: "Error: ID Postingan tidak ditemukan.", variant: "destructive" });
        return;
    }

    try {
      const res = await fetch(
        `/api/post/updatepost/${formData._id}/${currentUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      )
      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.message || "Terjadi kesalahan!" })
        setUpdatePostError(data.message)
        return
      }

      if (res.ok) {
        toast({ title: "Artikel Berhasil Diperbarui!" })
        setUpdatePostError(null)
        navigate(`/post/${data.slug}`)
      }
    } catch (error) {
      toast({ title: "Terjadi kesalahan koneksi!" })
      setUpdatePostError("Terjadi kesalahan sistem.")
    }
  }

  // 4. Helper Change Standard
  const handleChange = (e) => {
       setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  // 5. Helper Checkbox Jenjang
  const handleJenjangChange = (e) => {
      const { value, checked } = e.target;
      
      let currentLevels = Array.isArray(formData.criteriaEducationLevel) 
          ? formData.criteriaEducationLevel 
          : [];

      if (checked) {
          setFormData({ ...formData, criteriaEducationLevel: [...currentLevels, value] });
      } else {
          setFormData({
              ...formData,
              criteriaEducationLevel: currentLevels.filter((level) => level !== value),
          });
      }
  };

  if (isLoadingData) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-600">Mengambil data postingan...</p>
          </div>
      )
  }

  return (
    <div className="p-3 max-w-4xl mx-auto min-h-screen pb-20">
      <h1 className="text-center text-3xl my-7 font-semibold text-slate-700">
        Edit Artikel Beasiswa
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
            value={formData.title || ''} 
          />

          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
            value={formData.category || ''} 
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
                <SelectItem value="berita">Berita</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* --- BAGIAN 2: UPLOAD GAMBAR --- */}
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

        {/* --- BAGIAN 3: SYARAT & KRITERIA --- */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-700" />
                <h3 className="text-lg font-bold text-blue-900">Filter & Kriteria Pendaftar</h3>
            </div>
            <p className="text-sm text-blue-600 mb-4">
                Update data ini jika ada perubahan syarat beasiswa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Target Jenjang */}
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
                                    checked={
                                        Array.isArray(formData.criteriaEducationLevel) && 
                                        formData.criteriaEducationLevel.includes(jenjang)
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`jenjang-${jenjang}`} className="text-sm text-slate-700 font-medium cursor-pointer">
                                    {jenjang === 'SMA' ? 'SMA/Sederajat' : 
                                     jenjang === 'Diploma' ? 'Diploma (D3/D4)' :
                                     jenjang === 'S1' ? 'Sarjana (S1)' : 'Pascasarjana (S2/S3)'}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Khusus Jurusan */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">2. Khusus Jurusan</label>
                    <div className="relative">
                        <Input 
                            type="text" 
                            id="criteriaMajor"
                            placeholder="Contoh: Teknik Informatika" 
                            className="bg-white border-blue-300 pl-9"
                            onChange={handleChange}
                            value={formData.criteriaMajor || ''}
                        />
                        <BookOpen size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                {/* 3. Minimal IPK */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">3. Minimal IPK / Nilai</label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            id="criteriaMinGPA"
                            placeholder="Contoh: 3.00" 
                            step="0.01"
                            className="bg-white border-blue-300 pl-9"
                            onChange={handleChange}
                            value={formData.criteriaMinGPA || ''}
                        />
                        <GraduationCap size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                {/* 4. Lokasi */}
                <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">4. Lokasi / Daerah</label>
                    <div className="relative">
                        <Input 
                            type="text" 
                            id="criteriaLocation"
                            placeholder="Contoh: Jawa Timur" 
                            className="bg-white border-blue-300 pl-9"
                            onChange={handleChange}
                            value={formData.criteriaLocation || ''}
                        />
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                {/* 5. Maksimal Income Ortu */}
                <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">5. Maksimal Penghasilan Ortu</label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            id="criteriaMaxIncome"
                            placeholder="Contoh: 5000000" 
                            className="bg-white border-blue-300 pl-9"
                            onChange={handleChange}
                            value={formData.criteriaMaxIncome || ''}
                        />
                        <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                </div>

                {/* 6. PERIODE PENDAFTARAN */}
                <div className="md:col-span-2 border-t border-blue-200 pt-4 mt-2">
                    <label className="text-sm font-bold text-slate-800 mb-3 block flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" /> 
                        6. Periode Pendaftaran
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                         {/* Tanggal Mulai */}
                        <div>
                             <p className="text-xs text-slate-500 mb-1 font-semibold">Tanggal Dibuka</p>
                             <div className="relative">
                                <Input 
                                    type="date" 
                                    id="startDate"
                                    className="bg-white border-blue-300"
                                    onChange={handleChange}
                                    value={formData.startDate || ''}
                                />
                             </div>
                        </div>

                        {/* Deadline */}
                        <div>
                             <p className="text-xs text-slate-500 mb-1 font-semibold">Batas Akhir (Deadline)</p>
                             <div className="relative">
                                <Input 
                                    type="date" 
                                    id="deadline"
                                    className="bg-white border-blue-300"
                                    onChange={handleChange}
                                    value={formData.deadline || ''}
                                />
                             </div>
                        </div>
                    </div>
                </div>

                {/* 7. LINK PENDAFTARAN (UPDATE: BARU DITAMBAHKAN) */}
                <div className="md:col-span-2 border-t border-blue-200 pt-4 mt-2">
                    <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                        <ExternalLink size={18} className="text-blue-600" /> 
                        7. Link Pendaftaran (Official)
                    </label>
                    <div className="relative">
                        <Input 
                            type="text" 
                            id="officialLink"
                            placeholder="https://website-beasiswa-resmi.com/daftar"
                            className="bg-white border-blue-300"
                            onChange={handleChange}
                            value={formData.officialLink || ''}
                        />
                        <p className="text-[10px] text-slate-500 mt-1 ml-1">
                            *Pastikan link menyertakan http:// atau https:// agar tombol berfungsi.
                        </p>
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
                value={formData.content || ''}
            />
        </div>

        <Button
          type="submit"
          className="h-14 bg-green-600 hover:bg-green-700 font-bold text-lg shadow-lg mt-10"
        >
          Perbarui Artikel
        </Button>

        {updatePostError && (
          <p className="text-red-600 mt-5 text-center bg-red-50 p-3 rounded">{updatePostError}</p>
        )}
      </form>
    </div>
  )
}

export default EditPost