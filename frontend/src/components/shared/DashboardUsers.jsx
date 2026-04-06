import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { FaCheck, FaUserEdit } from "react-icons/fa" // Tambah Icon Edit
import { RxCross2 } from "react-icons/rx"

const DashboardUsers = () => {
  const { currentUser } = useSelector((state) => state.user)
  const [users, setUsers] = useState([])
  const [showMore, setShowMore] = useState(true)
  const [userIdToDelete, setUserIdToDelete] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`)
        const data = await res.json()

        if (res.ok) {
          setUsers(data.users)
          if (data.users.length < 9) {
            setShowMore(false)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (currentUser.isAdmin) {
      fetchUsers()
    }
  }, [currentUser._id])

  // --- FUNGSI BARU: UBAH ROLE KONTRIBUTOR ---
  const handleToggleContributor = async (userId) => {
    try {
      const res = await fetch(`/api/user/toggle-contributor/${userId}`, {
        method: "PUT",
      })
      const data = await res.json()

      if (res.ok) {
        // Update state lokal secara langsung agar UI berubah tanpa refresh
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, isUserContributor: data.isUserContributor }
              : user
          )
        )
      } else {
        console.log(data.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }
  // ------------------------------------------

  const handleShowMore = async () => {
    const startIndex = users.length
    try {
      const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`)
      const data = await res.json()
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users])
        if (data.users.length < 9) {
          setShowMore(false)
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete))
      } else {
        console.log(data.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-3 table-auto overflow-x-scroll scrollbar-none">
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <Table>
            <TableCaption>Kelola Pengguna & Kontributor</TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead>Tanggal Gabung</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Admin</TableHead>
                {/* KOLOM BARU */}
                <TableHead>Status Kontributor</TableHead>
                <TableHead>Ubah Role</TableHead>
                {/* ---------- */}
                <TableHead>Hapus</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y">
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className="w-10 h-10 object-cover bg-gray-500 rounded-full"
                    />
                  </TableCell>

                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>

                  {/* STATUS ADMIN */}
                  <TableCell>
                    {user.isAdmin ? (
                      <FaCheck className="text-green-600" />
                    ) : (
                      <RxCross2 className="text-red-600" />
                    )}
                  </TableCell>

                  {/* STATUS KONTRIBUTOR (BARU) */}
                  <TableCell>
                    {user.isUserContributor ? (
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                        Kontributor
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">User Biasa</span>
                    )}
                  </TableCell>

                  {/* TOMBOL UBAH ROLE (BARU) */}
                  <TableCell>
                    {/* Admin tidak bisa mengubah rolenya sendiri di sini agar aman */}
                    {!user.isAdmin && (
                      <button
                        onClick={() => handleToggleContributor(user._id)}
                        className={`flex items-center gap-1 text-xs border px-2 py-1 rounded transition
                          ${
                            user.isUserContributor
                              ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                          }`}
                      >
                        <FaUserEdit />
                        {user.isUserContributor
                          ? "Hapus Akses"
                          : "Jadikan Kontributor"}
                      </button>
                    )}
                  </TableCell>

                  {/* DELETE USER */}
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <span
                          onClick={() => {
                            setUserIdToDelete(user._id)
                          }}
                          className="font-medium text-red-600 hover:underline cursor-pointer"
                        >
                          Delete
                        </span>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the user.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={handleDeleteUser}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-blue-700 self-center text-sm py-7"
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no users yet!</p>
      )}
    </div>
  )
}

export default DashboardUsers