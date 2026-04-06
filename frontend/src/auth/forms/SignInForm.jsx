import React from "react"
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
import { useDispatch, useSelector } from "react-redux"
import { 
  signInFailure, 
  signInStart, 
  signInSuccess 
} from "@/redux/user/userSlice"
import GoogleAuth from "@/components/shared/GoogleAuth"
import { Loader2, AlertCircle } from "lucide-react"

// --- 1. IMPORT LOGO GAMBAR ---
import logoImage from "../../assets/logo.png";

// Schema Validasi
const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Format email tidak valid." }),
  password: z
    .string()
    .min(1, { message: "Password tidak boleh kosong." }), 
})

const SignInForm = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { loading, error: errorMessage } = useSelector((state) => state.user)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Logic Submit
  async function onSubmit(values) {
    try {
      dispatch(signInStart())

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (data.success === false) {
        toast({ 
            variant: "destructive",
            title: "Gagal Masuk",
            description: "Email atau password salah."
        })
        dispatch(signInFailure(data.message))
        return
      }

      if (res.ok) {
        dispatch(signInSuccess(data))
        toast({ 
            title: "Selamat Datang!", 
            description: "Gerbang masa depanmu telah terbuka." 
        })
        navigate("/")
      }
    } catch (error) {
      toast({ 
          variant: "destructive",
          title: "Terjadi Kesalahan", 
          description: error.message 
      })
      dispatch(signInFailure(error.message))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl gap-10 flex-col md:flex-row items-center">
        
        {/* --- BAGIAN KIRI (Branding dengan Logo Gambar) --- */}
        <div className="flex-1 text-center md:text-left space-y-5">
          
          {/* --- 2. LOGO DIGANTI DI SINI --- */}
          <Link
            to={"/"}
            className="flex justify-center md:justify-start items-center"
          >
            <img 
                src={logoImage} 
                alt="Logo Gerbang Beasiswa" 
                // Styling agar ukurannya sama dengan di halaman Sign Up
                className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          {/* Copywriting Filosofis */}
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-4">
            Kunci Menuju <span className="text-blue-900">Kesuksesan</span>
          </h2>

          <p className="text-slate-600 text-lg leading-relaxed">
            Masuk sekarang untuk mengakses sistem rekomendasi cerdas kami. Biarkan kami mencarikan peluang studi yang paling tepat untuk profil Anda.
          </p>
        </div>

        {/* --- BAGIAN KANAN (Form Login) --- */}
        <div className="flex-1 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-900">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Login Peserta</h3>
            <p className="text-sm text-gray-500">Silakan masukkan akun Anda</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
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
                    Membuka Gerbang...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </Button>

              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400 font-medium">Atau akses melalui</span>
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

          <div className="flex gap-2 text-sm mt-8 justify-center">
            <span className="text-gray-500">Belum memiliki kunci akses?</span>
            {/* Link Warna Emas */}
            <Link to="/sign-up" className="text-amber-600 font-bold hover:text-amber-700 hover:underline">
              Daftar Sekarang
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SignInForm