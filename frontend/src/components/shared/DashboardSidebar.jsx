import React, { useEffect, useState } from "react"
import { 
  FaComments, 
  FaSignOutAlt, 
  FaUserAlt, 
  FaUsers, 
  FaBuilding 
} from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom" // [UPDATE] Tambahkan useNavigate
import { IoIosCreate, IoIosDocument } from "react-icons/io"
import { MdDashboardCustomize } from "react-icons/md"
import { signOutSuccess } from "../../redux/user/userSlice" 

const DashboardSidebar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate() // [UPDATE] Inisialisasi navigate
  const { currentUser } = useSelector((state) => state.user)
  const [tab, setTab] = useState("")

  // Mendeteksi tab aktif dari URL untuk styling
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get("tab")
    if (tabFromUrl) {
      setTab(tabFromUrl)
    }
  }, [location.search])

  // --- FUNGSI SIGNOUT ---
  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        console.log(data.message)
      } else {
        dispatch(signOutSuccess())
        navigate('/sign-in') // [UPDATE] Arahkan ke sign-in setelah logout sukses
      }
    } catch (error) {
      console.log("Sidebar Signout Error:", error.message)
    }
  }

  // Helper untuk styling tombol menu (Active vs Inactive)
  const getLinkClass = (pathTab) => {
    if (!pathTab) {
        if (location.pathname === "/create-post") {
            return "flex items-center px-4 py-3 bg-blue-900 text-white rounded-lg shadow-md transition-all duration-200 font-medium"
        }
        return "flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-all duration-200 font-medium"
    }

    return tab === pathTab
      ? "flex items-center px-4 py-3 bg-blue-900 text-white rounded-lg shadow-md transition-all duration-200 font-medium"
      : "flex items-center px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-all duration-200 font-medium"
  }

  return (
    <aside className="h-full w-full bg-white flex flex-col font-sans border-r border-slate-200 min-h-screen">
      
      {/* --- HEADER SIDEBAR --- */}
      <div className="h-20 flex items-center justify-center border-b border-slate-100 px-6">
        <Link to="/" className="flex flex-col items-center">
             <div className="flex gap-1 text-xl font-bold tracking-tight">
                <span className="text-blue-900">Gerbang</span>
                <span className="text-amber-500">Beasiswa</span>
             </div>
             <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Panel Kontrol</span>
        </Link>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          
          {currentUser?.isAdmin && (
            <li>
              <Link to={"/dashboard?tab=dash"} className={getLinkClass("dash")}>
                <MdDashboardCustomize className="mr-3 text-lg" />
                <span>Dashboard</span>
              </Link>
            </li>
          )}

          {currentUser?.isAdmin && (
            <li>
                <Link to={"/dashboard?tab=partners"} className={getLinkClass("partners")}>
                    <FaBuilding className="mr-3 text-lg" />
                    <span>Mitra Institusi</span>
                </Link>
            </li>
          )}

          <li>
            <Link to={"/dashboard?tab=profile"} className={getLinkClass("profile")}>
              <FaUserAlt className="mr-3 text-lg" />
              <span>Profil Saya</span>
            </Link>
          </li>

          {currentUser && (currentUser.isAdmin || currentUser.isUserContributor) && (
            <li>
              <Link to={"/create-post"} className={getLinkClass(null)}>
                <IoIosCreate className="mr-3 text-lg" />
                <span>Buat Artikel</span>
              </Link>
            </li>
          )}

          {currentUser && (currentUser.isAdmin || currentUser.isUserContributor) && (
            <li>
              <Link to={"/dashboard?tab=posts"} className={getLinkClass("posts")}>
                <IoIosDocument className="mr-3 text-lg" />
                <span>{currentUser.isAdmin ? "Kelola Semua Artikel" : "Artikel Saya"}</span>
              </Link>
            </li>
          )}

          {currentUser?.isAdmin && (
            <li>
              <Link to={"/dashboard?tab=users"} className={getLinkClass("users")}>
                <FaUsers className="mr-3 text-lg" />
                <span>Data Pengguna</span>
              </Link>
            </li>
          )}

          {currentUser?.isAdmin && (
            <li>
              <Link to={"/dashboard?tab=comments"} className={getLinkClass("comments")}>
                <FaComments className="mr-3 text-lg" />
                <span>Komentar Masuk</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* --- FOOTER (LOGOUT) --- */}
      <div className="p-4 border-t border-slate-100 mb-4">
         <div className="px-4 py-4 bg-slate-50 rounded-xl mb-2">
            <p className="text-xs text-slate-500">Login sebagai:</p>
            <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-semibold text-blue-900 truncate max-w-[100px]">{currentUser?.username}</p>
                
                {currentUser?.isAdmin ? (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Admin</span>
                ) : currentUser?.isUserContributor ? (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Mitra</span>
                ) : (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">User</span>
                )}
            </div>
         </div>

        <button
          className="flex items-center justify-center w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200 font-semibold"
          onClick={handleSignout}
        >
          <FaSignOutAlt className="mr-2" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  )
}

export default DashboardSidebar