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
        let url = `/api/post/getposts`
        
        if (!currentUser.isAdmin) {
            url += `?userId=${currentUser._id}`
        }

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

  const handleApprove = async (postId) => {
      try {
        const res = await fetch(`/api/post/approve-post/${postId}/${currentUser._id}`, {
            method: 'PUT',
        });
        
        if (res.ok) {
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
          <div className="w-full overflow-x-auto border rounded-lg shadow-sm bg-white">
              <Table>
                <TableCaption>Daftar artikel yang tersedia.</TableCaption>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[120px]">Tanggal</TableHead>
                    <TableHead className="min-w-[220px]">Penulis & Institusi</TableHead> 
                    <TableHead>Cover</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y">
                    {userPosts.map((post) => (
                      <TableRow key={post._id} className={post.status !== 'approved' && currentUser.isAdmin ? "bg-yellow-50/50 hover:bg-yellow-50" : "hover:bg-slate-50 transition-colors"}>
                        <TableCell className="text-slate-600 text-xs">
                          {new Date(post.updatedAt).toLocaleDateString('id-ID')}
                        </TableCell>

                        {/* --- KOLOM PENULIS & INSTITUSI --- */}
                        <TableCell>
                          <div className="flex flex-col gap-1 py-1">
                            <div className="flex items-center gap-2">
                              <img 
                                src={post.userId?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} 
                                alt="avatar" 
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                              <span className="text-sm font-bold text-slate-800">
                                {/* Menampilkan Nama Organisasi dari postingan atau dari profil user */}
                                {post.organizationName || post.userId?.organizationName || "Institusi Umum"}
                              </span>
                            </div>
                            
                            <div className="text-[11px] text-slate-500 pl-9 italic">
                               <span className="font-semibold not-italic text-slate-400">PJ:</span> {post.pic || post.userId?.username || "Anonim"}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Link to={`/post/${post.slug}`}>
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-16 h-10 object-cover rounded bg-gray-200 shadow-sm"
                            />
                          </Link>
                        </TableCell>

                        <TableCell className="font-medium max-w-[200px] text-sm truncate">
                          <Link to={`/post/${post.slug}`} className="text-slate-700 hover:text-blue-600 transition">
                              {post.title}
                          </Link>
                        </TableCell>

                        <TableCell>
                            {post.status === 'approved' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">
                                    Tayang
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse">
                                    Review
                                </span>
                            )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                              {currentUser.isAdmin && post.status !== 'approved' && (
                                  <button
                                      onClick={() => handleApprove(post._id)}
                                      className="text-[10px] bg-green-600 text-white px-2.5 py-1.5 rounded hover:bg-green-700 transition font-bold uppercase"
                                  >
                                      Setujui
                                  </button>
                              )}

                              <Link
                                to={`/update-post/${post._id}`}
                                className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                              >
                                Edit
                              </Link>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <span
                                    onClick={() => setPostIdToDelete(post._id)}
                                    className="text-red-500 hover:text-red-700 font-bold text-xs uppercase cursor-pointer"
                                  >
                                    Hapus
                                  </span>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
                                    <AlertDialogDescription>Tindakan ini permanen.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeletePost}>
                                      Ya, Hapus
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
            <button onClick={handleShowMore} className="w-full text-blue-600 font-semibold hover:text-blue-800 text-sm py-6 transition">
              Muat lebih banyak...
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white w-full rounded-lg border border-dashed">
            <p className="text-slate-400 mb-2">Belum ada artikel.</p>
             <Link to="/create-post" className="text-blue-500 font-bold hover:underline">Buat Baru</Link>
        </div>
      )}
    </div>
  )
}

export default DashboardPosts