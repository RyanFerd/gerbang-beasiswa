import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import SignInForm from './auth/forms/SignInForm'
import SignUpForm from './auth/forms/SignUpForm'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'
import PrivateRoute from './components/shared/PrivateRouter'
import CreatePost from './pages/CreatePost'
import AdminPrivateRoute from './components/shared/AdminPrivateRoute'
import EditPost from './pages/EditPost'
import PostDetails from './pages/PostDetails'
import ScrollToTop from './components/shared/ScrollToTop'
import Home from './pages/Home'
import Search from './pages/Search'
import Recommendation from "./pages/Recommendation"
import { Toaster } from "./components/ui/toaster" // Import Toaster cukup satu kali di sini
import SignUpContributor from './auth/forms/SignUpContributor'

const AppLayout = () => {
  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        {/* --- PUBLIC ROUTES (Siapapun bisa akses) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignInForm />} />
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/sign-up-contributor" element={<SignUpContributor />} />
        <Route path="/home" element={<Home />} /> 
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/news" element={<Search />} />
        <Route path="/post/:postSlug" element={<PostDetails />} />
        <Route path="/recommendation" element={<Recommendation />} />

        {/* --- PRIVATE ROUTES (Harus Login: Admin & Kontributor & User Biasa) --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* PINDAHKAN KE SINI: Supaya Kontributor bisa akses */}
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:postId" element={<EditPost />} />
        </Route>

        {/* --- ADMIN ONLY ROUTES (Hanya Admin) --- */}
        <Route element={<AdminPrivateRoute />}>
           {/* Nanti bisa diisi halaman khusus admin, misal: Kelola User */}
           {/* Saat ini kosong dulu tidak apa-apa */}
        </Route>

      </Routes>
      <Footer />
      <Toaster />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App