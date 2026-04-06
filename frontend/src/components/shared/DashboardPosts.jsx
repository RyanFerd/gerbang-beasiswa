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
import { Link } from "react-router-dom"
import { useToast } from "../../hooks/use-toast";
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

const DashboardPosts = () => {
  const { currentUser } = useSelector((state) => state.user)
  const { toast } = useToast() 

  const [userPosts, setUserPosts] = useState([])
  const [showMore, setShowMore] = useState(true)
  const [postIdToDelete, setPostIdToDelete] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // --- PERBAIKAN LOGIKA DISINI ---
        // Jika Admin: Ambil SEMUA post (tanpa filter userId) agar bisa review punya orang lain.
        // Jika Kontributor: Ambil hanya post MILIK SENDIRI (userId=...).
        let url = `/api/post/getposts`
        
        if (!currentUser.isAdmin) {
            url += `?userId=${currentUser._id}`
        }
        // -------------------------------

        const res = await fetch(url)
        const data = await res.json()

        if (res.ok) {
          setUserPosts(data.posts)
          if (data.posts.length < 9) {
            setShowMore(false)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (currentUser) {
        fetchPosts()
    }
  }, [currentUser._id, currentUser.isAdmin])

  const handleShowMore = async () => {
    const startIndex = userPosts.length
    try {
      // --- PERBAIKAN LOGIKA LOAD MORE ---
      let url = `/api/post/getposts?startIndex=${startIndex}`
      if (!currentUser.isAdmin) {
          url += `&userId=${currentUser._id}`
      }
      
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts])
        if (data.posts.length < 9) {
          setShowMore(false)
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleDeletePost = async () => {
    try {
      const res = await fetch(
        `/api/post/deletepost/${postIdToDelete}/${currentUser._id}`,
        { method: "DELETE" }
      )
      const data = await res.json()
      if (!res.ok) {
        console.log(data.message)
        toast({ title: "Gagal menghapus", description: data.message, variant: "destructive" })
      } else {
        setUserPosts((prev) =>
          prev.filter((post) => post._id !== postIdToDelete)
        )
        toast({ title: "Artikel berhasil dihapus." })
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  // --- FUNGSI APPROVE ---
  const handleApprove = async (postId) => {
      try {
        // Kita butuh endpoint backend untuk ini (Langkah 2 & 3 di bawah)
        const res = await fetch(`/api/post/approve-post/${postId}/${currentUser._id}`, {
            method: 'PUT',
        });
        
        if (res.ok) {
            // Update tampilan secara realtime
            setUserPosts((prev) =>
                prev.map((post) =>
                    post._id === postId ? { ...post, status: 'approved' } : post
                )
            );
            toast({ title: "Artikel Disetujui!", description: "Artikel kini sudah tayang untuk publik." });
        } else {
            const data = await res.json()
            toast({ title: "Gagal", description: data.message, variant: "destructive" });
        }
      } catch (error) {
          console.log(error.message);
          toast({ title: "Error sistem", variant: "destructive" });
      }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-3 font-sans">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {currentUser.isAdmin ? "Kelola Semua Artikel" : "Artikel Saya"}
      </h1>
      
      {userPosts.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
              <Table>
                <TableCaption>Daftar artikel yang tersedia.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Penulis</TableHead> {/* Tambahan Info Penulis untuk Admin */}
                    <TableHead>Cover</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y">
                    {userPosts.map((post) => (
                      <TableRow key={post._id} className={post.status === 'waiting' && currentUser.isAdmin ? "bg-yellow-50" : ""}>
                        <TableCell>
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-xs text-slate-500">
                             {/* Tampilkan UserId atau nama jika sudah di-populate di backend, sementara pakai ID/Placeholder */}
                             {post.userId === currentUser._id ? "Anda" : "Kontributor"}
                        </TableCell>

                        <TableCell>
                          <Link to={`/post/${post.slug}`}>
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-14 h-10 object-cover rounded bg-gray-200"
                            />
                          </Link>
                        </TableCell>

                        <TableCell className="font-medium max-w-xs truncate">
                          <Link to={`/post/${post.slug}`} className="hover:text-blue-600 transition">
                              {post.title}
                          </Link>
                        </TableCell>

                        {/* STATUS BADGE */}
                        <TableCell>
                            {/* Cek status approved atau publish */}
                            {post.status === 'approved' || post.status === 'publish' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Tayang
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                    Menunggu Review
                                </span>
                            )}
                        </TableCell>

                        {/* AKSI */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                              
                              {/* TOMBOL APPROVE (Hanya Admin & Status bukan approved) */}
                              {currentUser.isAdmin && post.status !== 'approved' && post.status !== 'publish' && (
                                  <button
                                      onClick={() => handleApprove(post._id)}
                                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition shadow-sm font-semibold"
                                  >
                                      Setujui
                                  </button>
                              )}

                              <Link
                                to={`/update-post/${post._id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                Edit
                              </Link>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <span
                                    onClick={() => setPostIdToDelete(post._id)}
                                    className="text-red-600 hover:text-red-800 font-medium text-sm cursor-pointer"
                                  >
                                    Hapus
                                  </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tindakan ini permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={handleDeletePost}
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
          </div>

          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full text-blue-600 font-semibold hover:text-blue-800 text-sm py-6 transition"
            >
              Muat lebih banyak...
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-10">
            <p className="text-slate-500">Belum ada artikel.</p>
             <Link to="/create-post" className="text-blue-500 hover:underline">Buat Baru</Link>
        </div>
      )}
    </div>
  )
}

export default DashboardPosts