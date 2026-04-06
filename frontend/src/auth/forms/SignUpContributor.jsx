import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  Building2, 
  Loader2, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react"

// --- IMPORT LOGO (Sesuaikan path jika perlu) ---
import logoImage from "../../assets/logo.png";

// --- SCHEMA VALIDASI (ZOD) ---
const formSchema = z.object({
  username: z.string().min(2, { message: "Nama Penanggung Jawab minimal 2 karakter." }),
  organizationName: z.string().min(2, { message: "Nama Organisasi wajib diisi." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  website: z.string().optional(), // Opsional
  password: z.string().min(8, { message: "Password minimal 8 karakter." }),
})

export default function SignUpContributor() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [successMode, setSuccessMode] = useState(false)

  // Setup Form dengan React Hook Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      organizationName: "",
      email: "",
      website: "",
      password: "",
    },
  })

  // Handle Submit
  async function onSubmit(values) {
    try {
      setLoading(true)

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...values,
            isUserContributor: true // Flag khusus Mitra
        }),
      })

      const data = await res.json()

      if (data.success === false) {
        setLoading(false)
        toast({ 
            variant: "destructive",
            title: "Pendaftaran Gagal", 
            description: data.message 
        })
        return
      }

      setLoading(false)

      if (res.ok) {
        setSuccessMode(true) // Pindah ke tampilan sukses
        toast({ 
            title: "Registrasi Terkirim", 
            description: "Silakan cek status verifikasi Anda." 
        })
      }
    } catch (error) {
      setLoading(false)
      toast({ variant: "destructive", title: "Terjadi kesalahan sistem." })
    }
  }

  // --- TAMPILAN JIKA SUKSES MENDAFTAR (MENUNGGU VERIFIKASI) ---
  if (successMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                  Terima kasih telah mendaftar sebagai Mitra Beasiswa. 
                  Data institusi <strong>{form.getValues("organizationName")}</strong> sedang dalam proses <b>verifikasi oleh Admin</b>.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-800 mb-6 text-left flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Akun Anda belum aktif. Mohon tunggu persetujuan Admin (1x24 Jam) sebelum bisa login.</span>
              </div>

              <Link to="/sign-in">
                  <Button className="w-full bg-blue-900 hover:bg-blue-800 h-11">Kembali ke Halaman Login</Button>
              </Link>
          </div>
      </div>
    )
  }

  // --- TAMPILAN FORM UTAMA ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-5xl gap-10 flex-col md:flex-row items-stretch">
        
        {/* --- BAGIAN KIRI (Branding Khusus Mitra) --- */}
        <div className="md:w-1/2 bg-blue-900 p-10 rounded-2xl text-white flex flex-col justify-center relative shadow-lg">
            <div className="absolute top-8 left-8 bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-white" />
            </div>
            
            <div className="mt-12">
                <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Mitra Beasiswa</h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                    Bergabunglah bersama kami untuk mencerdaskan kehidupan bangsa. Kelola program beasiswa Anda secara efisien dan transparan.
                </p>
                
                <ul className="space-y-4 text-blue-50">
                    <li className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-300" />
                        <span>Publikasi beasiswa jangkauan nasional</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-300" />
                        <span>Sistem seleksi berkas otomatis</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-300" />
                        <span>Dashboard analitik pelamar</span>
                    </li>
                </ul>
            </div>

            <div className="mt-auto pt-10 border-t border-blue-800/50">
                <p className="text-sm text-blue-300 mb-2">Bukan penyedia beasiswa?</p>
                <Link to="/sign-up" className="text-white font-bold hover:text-blue-200 transition-colors flex items-center gap-2">
                    &larr; Daftar sebagai Mahasiswa/Umum
                </Link>
            </div>
        </div>

        {/* --- BAGIAN KANAN (Form Mitra) --- */}
        <div className="md:w-1/2 bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Registrasi Institusi</h3>
            <p className="text-sm text-gray-500 mt-1">Lengkapi profil organisasi atau yayasan Anda</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Nama Penanggung Jawab */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Penanggung Jawab</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap Anda" {...field} className="bg-slate-50 border-slate-300 focus:ring-blue-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nama Organisasi */}
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Organisasi / Instansi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Yayasan Indonesia Maju" {...field} className="bg-slate-50 border-slate-300 focus:ring-blue-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Resmi</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@organisasi.com" {...field} className="bg-slate-50 border-slate-300 focus:ring-blue-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website (Opsional) */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} className="bg-slate-50 border-slate-300 focus:ring-blue-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Password akun" {...field} className="bg-slate-50 border-slate-300 focus:ring-blue-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold h-11 mt-4" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Daftar Sebagai Mitra"
                )}
              </Button>

            </form>
          </Form>

          <div className="flex gap-2 text-sm mt-8 justify-center">
            <span className="text-gray-500">Sudah punya akun mitra?</span>
            <Link to="/sign-in" className="text-blue-900 font-bold hover:underline">
              Masuk di sini
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}