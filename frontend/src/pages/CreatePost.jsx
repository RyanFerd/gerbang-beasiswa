import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getFilePreview, uploadFile } from "@/lib/appwrite/uploadImage";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Target,
  BookOpen,
  MapPin,
  DollarSign,
  GraduationCap,
  Info,
  CalendarClock,
  ExternalLink,
  ArrowLeft,
  ShieldAlert,
  UserCheck
} from "lucide-react";

const CreatePost = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // --- LOGIKA VALIDASI PROFIL (DIPERBAIKI) ---
  // Menggunakan isUserContributor sesuai dengan skema database/Redux kamu
  const isProfileIncomplete = (currentUser?.isUserContributor || currentUser?.isAdmin) && !currentUser?.organizationName;
  // ------------------------------

  const [file, setFile] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    criteriaEducationLevel: [],
  });
  const [createPostError, setCreatePostError] = useState(null);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Mohon pilih gambar terlebih dahulu!");
        toast({ title: "Mohon pilih gambar terlebih dahulu!", variant: "destructive" });
        return;
      }
      setImageUploading(true);
      setImageUploadError(null);

      const uploadedFile = await uploadFile(file);
      const postImageUrl = getFilePreview(uploadedFile.$id);

      setFormData({ ...formData, image: postImageUrl });
      toast({ title: "Gambar berhasil diunggah!" });
      setImageUploading(false);
    } catch (_error) {
      setImageUploadError("Gagal mengunggah gambar");
      toast({ title: "Gagal mengunggah gambar!", variant: "destructive" });
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- GEMBOK GANDA ---
    // Mencegah submit paksa jika profil belum lengkap
    if (isProfileIncomplete) {
      toast({ 
        title: "Akses Ditolak!", 
        description: "Anda wajib melengkapi Nama Organisasi di profil sebelum membuat artikel.", 
        variant: "destructive" 
      });
      return;
    }

    if (formData.startDate && formData.deadline) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.deadline);
      if (end < start) {
        setCreatePostError("Tanggal penutupan tidak boleh lebih awal dari tanggal dibuka.");
        toast({ title: "Cek kembali tanggal pendaftaran!", variant: "destructive" });
        return;
      }
    }

    const submitData = {
      ...formData,
      organizationName: currentUser.organizationName, 
      pic: currentUser.username, 
    };

    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData), 
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Terjadi kesalahan!", description: data.message, variant: "destructive" });
        setCreatePostError(data.message);
        return;
      }

      if (res.ok) {
        setCreatePostError(null);
        if (currentUser.isAdmin) {
          toast({ title: "Artikel Berhasil Diterbitkan!" });
          navigate(`/post/${data.slug}`);
        } else {
          toast({
            title: "Artikel Terkirim!",
            description: "Artikel Anda sedang ditinjau oleh Admin sebelum ditayangkan.",
          });
          navigate("/dashboard?tab=posts");
        }
      }
    } catch (_error) {
      toast({ title: "Terjadi kesalahan sistem!", variant: "destructive" });
      setCreatePostError("Terjadi kesalahan sistem saat mencoba mengirim data.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

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
    <div className="p-4 max-w-7xl mx-auto min-h-screen pb-20 md:px-10 font-sans relative">
      
      {/* --- OVERLAY BLOKIR --- */}
      {isProfileIncomplete && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border-2 border-indigo-100 shadow-2xl p-8 rounded-3xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="text-indigo-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Profil Belum Lengkap!</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Untuk menjaga validitas informasi, Anda <b>wajib</b> melengkapi data Organisasi/Instansi di profil sebelum dapat menerbitkan artikel beasiswa.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate("/dashboard?tab=profile")}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <UserCheck size={18} /> Lengkapi Profil Sekarang
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-slate-500"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between my-8 border-b pb-5">
        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Kembali</span>
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex-1 text-center pr-0 sm:pr-20">
          Buat Artikel Beasiswa
        </h1>
      </div>

      <form className={`flex flex-col lg:grid lg:grid-cols-12 gap-8 ${isProfileIncomplete ? 'opacity-20 pointer-events-none' : ''}`} onSubmit={handleSubmit}>
        
        {/* --- KOLOM KIRI (DATA UTAMA) --- */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Judul Artikel / Nama Beasiswa"
              required
              id="title"
              className="sm:col-span-3 h-12 border-slate-300 focus-visible:ring-blue-500"
              onChange={handleChange}
            />
            <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="h-12 border-slate-300">
                <SelectValue placeholder="Kategori" />
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

          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-3">
              <Target className="text-blue-700" size={20} />
              <h3 className="text-lg font-bold text-blue-900">Filter & Kriteria Pendaftar</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 mb-3 block">
                  1. Target Jenjang (Bisa pilih {">"} 1)
                </label>
                <div className="bg-white border border-blue-200 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["TK", "SD", "SMP", "SMA", "Diploma", "S1", "S2", "S3"].map((jenjang) => (
                    <div key={jenjang} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`jenjang-${jenjang}`}
                        value={jenjang}
                        onChange={handleJenjangChange}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor={`jenjang-${jenjang}`} className="text-xs text-slate-700 font-medium cursor-pointer">
                        {jenjang}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">2. Khusus Jurusan</label>
                <div className="relative">
                  <Input id="criteriaMajor" placeholder="Semua Jurusan" className="bg-white pl-9 border-slate-300" onChange={handleChange} />
                  <BookOpen size={16} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">3. Minimal IPK / Nilai</label>
                <div className="relative">
                  <Input type="number" id="criteriaMinGPA" placeholder="Contoh: 3.50" step="0.01" className="bg-white pl-9 border-slate-300" onChange={handleChange} />
                  <GraduationCap size={16} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">4. Lokasi / Daerah</label>
                <div className="relative">
                  <Input id="criteriaLocation" placeholder="Nasional / Provinsi" className="bg-white pl-9 border-slate-300" onChange={handleChange} />
                  <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">5. Maks. Penghasilan Ortu</label>
                <div className="relative">
                  <Input type="number" id="criteriaMaxIncome" placeholder="Contoh: 5000000" className="bg-white pl-9 border-slate-300" onChange={handleChange} />
                  <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Isi Konten Artikel <span className="text-red-500">*</span>
            </label>
            <ReactQuill
              theme="snow"
              placeholder="Tulis detail persyaratan..."
              className="h-80 mb-14 bg-white"
              required
              onChange={(value) => setFormData({ ...formData, content: value })}
            />
          </div>
        </div>

        {/* --- KOLOM KANAN (SIDEBAR) --- */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="lg:sticky lg:top-8 flex flex-col gap-6">
            <div className="bg-white border-2 border-dashed border-slate-300 p-5 rounded-2xl shadow-sm">
              <label className="text-sm font-bold text-slate-700 mb-3 block">Cover Beasiswa</label>
              {formData.image ? (
                <img src={formData.image} alt="preview" className="w-full h-44 object-cover rounded-xl mb-4 border" />
              ) : (
                <div className="w-full h-44 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mb-4 text-slate-400 text-xs text-center p-4">
                  Belum ada gambar disematkan
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-xs cursor-pointer border-slate-200" />
                <Button type="button" variant="secondary" onClick={handleUploadImage} disabled={imageUploading} className="w-full">
                  {imageUploading ? "Mengunggah..." : "Upload Cover"}
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <CalendarClock size={16} className="text-slate-500" /> Periode Pendaftaran
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Tanggal Buka</p>
                        <Input type="date" id="startDate" className="bg-white border-slate-300" onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Tanggal Deadline</p>
                        <Input type="date" id="deadline" className="bg-white border-slate-300" onChange={handleChange} />
                    </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                  <ExternalLink size={16} className="text-slate-500" /> Link Website Resmi
                </label>
                <Input type="url" id="officialLink" placeholder="https://..." className="bg-white border-slate-300" onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-4">
                <Button type="submit" className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg">
                  {currentUser.isAdmin ? "Terbitkan Sekarang" : "Ajukan Artikel"}
                </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;