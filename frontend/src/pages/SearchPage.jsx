import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutSuccess } from "@/redux/user/userSlice"

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { currentUser } = useSelector((state) => state.user)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim() !== '') {
      navigate(`/search?searchTerm=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        console.log(data.message)
      } else {
        dispatch(signOutSuccess())
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 px-4 py-10 text-gray-800">
      
      {/* Profil & Sign Out Dropdown (jika login) */}
      <div className="absolute top-4 right-4">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <img
                  src={currentUser.profilePicture}
                  alt="user"
                  className="w-10 h-10 rounded-full border border-gray-300 shadow-sm object-cover"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60 bg-white shadow-lg rounded-md p-2 z-50" align="end" sideOffset={8}>
              <DropdownMenuLabel className="text-sm text-gray-600">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-sm font-medium flex flex-col items-start gap-1 cursor-default">
                <span className="text-gray-900">@{currentUser.username}</span>
                <span className="text-gray-500">{currentUser.email}</span>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/dashboard?tab=profile" className="w-full text-sm font-medium">
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleSignout}
                className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/sign-in"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Konten utama */}
      <div className="text-center mb-10 animate-fadeIn">
        <h2 className="text-lg md:text-xl text-gray-600 mb-2">
          Selamat datang di <span className="font-semibold text-blue-600">Beasiswa Nusantara</span>
        </h2>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          Temukan Beasiswa Impianmu
        </h1>
        <p className="text-sm text-gray-500 mt-2">Dapatkan peluang terbaik untuk masa depanmu!</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl flex items-center bg-white shadow-md rounded-full px-4 py-2"
      >
        <input
          type="text"
          placeholder="Cari beasiswa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-gray-700"
        />
        <button
          type="submit"
          className="ml-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300"
        >
          Cari
        </button>
      </form>
    </div>
  )
}

export default SearchPage
