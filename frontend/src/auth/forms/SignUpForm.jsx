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
import GoogleAuth from "@/components/shared/GoogleAuth"
import { Loader2, AlertCircle, Building2 } from "lucide-react" 

// --- IMPORT LOGO ---
import logoImage from "../../assets/logo.png";

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username minimal harus 2 karakter." }),
  email: z
    .string()
    .email({ message: "Format email tidak valid." }),
  password: z
    .string()
    .min(8, { message: "Password minimal harus 8 karakter." }),
})

const SignUpForm = () => {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values) {
    try {
      setLoading(true)
      setErrorMessage(null)

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (data.success === false) {
        setLoading(false)
        setErrorMessage(data.message)
        toast({ 
            variant: "destructive",
            title: "Pendaftaran Gagal", 
            description: data.message 
        })
        return
      }

      setLoading(false)

      if (res.ok) {
        toast({ 
            title: "Pendaftaran Berhasil!", 
            description: "Silakan login untuk melanjutkan." 
        })
        navigate("/sign-in")
      }
    } catch (error) {
      setErrorMessage(error.message)
      setLoading(false)
      toast({ variant: "destructive", title: "Terjadi kesalahan sistem." })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl gap-10 flex-col md:flex-row items-center">
        
        {/* --- BAGIAN KIRI (Branding & Copywriting) --- */}
        <div className="flex-1 text-center md:text-left space-y-5">
          
          <Link
            to={"/"}
            className="flex justify-center md:justify-start items-center"
          >
            <img 
                src={logoImage} 
                alt="Logo Gerbang Beasiswa" 
                className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-4">
            Mulai Perjalanan <span className="text-blue-900">Akademikmu</span>
          </h2>

          <p className="text-slate-600 text-lg leading-relaxed">
            Daftarkan diri Anda hari ini. Temukan beasiswa yang sesuai dengan profil, prestasi, dan kebutuhan finansial Anda melalui sistem cerdas kami.
          </p>
        </div>

        {/* --- BAGIAN KANAN (Form Daftar) --- */}
        <div className="flex-1 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-900">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Buat Akun Mahasiswa</h3>
            <p className="text-sm text-gray-500">Lengkapi data diri calon penerima beasiswa</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: ahmad_mahasiswa" 
                        {...field} 
                        className="bg-slate-50 border-slate-300 focus:border-blue-900 focus:ring-blue-900 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="nama@email.com" 
                        {...field} 
                        className="bg-slate-50 border-slate-300 focus:border-blue-900 focus:ring-blue-900 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-slate-50 border-slate-300 focus:border-blue-900 focus:ring-blue-900 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tombol Utama: Navy Blue */}
              <Button 
                type="submit" 
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold h-11 shadow-md transition-all mt-4" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses Data...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>

              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400 font-medium">Atau daftar dengan</span>
                  </div>
              </div>

              <GoogleAuth />
            </form>
          </Form>

          {/* Pesan Error */}
          {errorMessage && (
            <div className="mt-5 p-3 bg-red-50 border-l-4 border-red-500 rounded-r flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-2 text-sm mt-6 justify-center">
            <span className="text-gray-500">Sudah punya akun?</span>
            <Link to="/sign-in" className="text-amber-600 font-bold hover:text-amber-700 hover:underline">
              Masuk di sini
            </Link>
          </div>

          {/* --- BAGIAN TOMBOL DAFTAR KONTRIBUTOR (BARU) --- */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide font-semibold">
                Area Mitra & Penyedia Beasiswa
            </p>
            <Link to="/sign-up-contributor">
                <Button 
                    variant="outline" 
                    className="w-full border-dashed border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold flex items-center gap-2 justify-center"
                >
                    <Building2 className="w-4 h-4" />
                    Daftar sebagai Mitra Institusi
                </Button>
            </Link>
          </div>
          {/* ------------------------------------------------ */}

        </div>
      </div>
    </div>
  )
}

export default SignUpForm