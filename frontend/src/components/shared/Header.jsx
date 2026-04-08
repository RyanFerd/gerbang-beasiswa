import React, { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FaSearch } from "react-icons/fa"
import { HiBell } from "react-icons/hi"
import { Button } from "../ui/button"
import { useDispatch, useSelector } from "react-redux"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutSuccess } from "@/redux/user/userSlice"
import logoImg from '../../assets/logo.png';

const Header = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()

  const { currentUser } = useSelector((state) => state.user)
  const [searchTerm, setSearchTerm] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  
  // --- STATE NOTIFIKASI ---
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- AMBIL NOTIFIKASI DARI BACKEND ---
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/user/notifications`);
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      }
    } catch (error) {
      console.log("Error fetching notifications:", error.message);
    }
  };

  // --- TANDAI NOTIFIKASI SUDAH DIBACA ---
  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`/api/user/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // --- FUNGSI SIGNOUT (HANYA SATU) ---
  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", { 
        method: "POST" 
      });
      const data = await res.json();
      
      if (res.ok) {
        dispatch(signOutSuccess());
        navigate('/sign-in'); 
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log("Signout error:", error.message);
    }
  };

  // Effect untuk polling notifikasi
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Effect untuk styling header saat scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Effect untuk sinkronisasi searchTerm dari URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchTermFromUrl = urlParams.get("searchTerm")
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl)
    }
  }, [location.search])

  const handleSubmit = (e) => {
    e.preventDefault()
    const urlParams = new URLSearchParams(location.search)
    urlParams.set("searchTerm", searchTerm)
    navigate(`/search?${urlParams.toString()}`)
  }

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
        ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200" 
        : "bg-white border-b border-transparent"
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
        
        <Link to="/" className="flex items-center">
          <img src={logoImg} alt="Logo" className="h-10 md:h-16 w-auto object-contain transition-transform hover:scale-105" />
        </Link>

        <form className="hidden sm:flex bg-slate-50 border border-slate-200 px-4 py-2 rounded-full items-center w-64 md:w-80" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Cari beasiswa..."
            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit"><FaSearch className="text-slate-400 hover:text-blue-600 transition" /></button>
        </form>

        <div className="flex items-center gap-4">
          <ul className="hidden lg:flex gap-8 text-sm font-semibold text-slate-600 mr-4">
            <li><Link to="/" className="hover:text-blue-900 transition-colors">Beranda</Link></li>
            <li><Link to="/about" className="hover:text-blue-900 transition-colors">Tentang</Link></li>
            <li><Link to="/search" className="hover:text-blue-900 transition-colors">Cari Beasiswa</Link></li>
          </ul>

          {currentUser ? (
            <div className="flex items-center gap-4">
              
              {/* --- LONCENG NOTIFIKASI --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full focus:outline-none">
                    <HiBell className="text-2xl" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-white font-bold px-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 mt-2" align="end">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifikasi</span>
                    {unreadCount > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{unreadCount} Baru</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <DropdownMenuItem 
                          key={notif._id} 
                          className={`p-3 cursor-pointer border-b border-slate-50 last:border-0 ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                          onClick={() => handleMarkAsRead(notif._id)}
                        >
                          <div className="flex flex-col gap-1">
                            <p className={`text-sm leading-tight ${!notif.isRead ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {new Date(notif.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-400">Belum ada notifikasi</div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* --- PROFIL USER --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none ring-offset-2 focus:ring-2 ring-blue-500 rounded-full transition-all">
                    <img src={currentUser.profilePicture} alt="user" className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 mr-2" align="end">
                  <DropdownMenuLabel>
                      <p className="text-sm font-bold text-gray-800 truncate">@{currentUser.username}</p>
                      <p className="text-xs text-gray-500 truncate font-normal">{currentUser.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard?tab=profile" className="cursor-pointer font-medium w-full block">Dashboard & Profil</Link>
                  </DropdownMenuItem>
                  {currentUser.isAdmin && (
                      <DropdownMenuItem asChild>
                      <Link to="/create-post" className="cursor-pointer font-medium text-blue-600 w-full block">+ Tambah Data Beasiswa</Link>
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-semibold">
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link to="/sign-in">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all">
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header