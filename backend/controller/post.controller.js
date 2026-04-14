import Post from "../models/post.model.js"
import User from "../models/user.model.js" 
import { errorHandler } from "../utils/error.js"
import { createNotification } from "../utils/createNotification.js" 
import natural from "natural"
import sw from "stopword"
import jwt from "jsonwebtoken" 

// --- 1. CREATE POST ---
export const create = async (req, res, next) => {
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Mohon lengkapi judul dan konten!"))
  }

  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "")

  try {
    // Ambil data profil user untuk mendapatkan role dan nama organisasi
    const userProfile = await User.findById(req.user.id);

    // --- GEMBOK BACKEND 1: Hanya Admin / Kontributor yang boleh ---
    if (!userProfile.isAdmin && !userProfile.isUserContributor) {
      return next(errorHandler(403, "Akses ditolak! Anda tidak memiliki izin untuk membuat artikel."));
    }

    // --- GEMBOK BACKEND 2: Wajib punya organizationName ---
    if (!userProfile.organizationName) {
      return next(errorHandler(403, "Akses ditolak! Anda wajib melengkapi Nama Organisasi di profil Anda sebelum membuat artikel."));
    }

    const postStatus = req.user.isAdmin ? 'approved' : 'pending';

    const newPost = new Post({
      ...req.body,
      slug,
      userId: req.user.id,
      // Otomatis isi dari profil jika tidak diinput manual di form
      organizationName: req.body.organizationName || userProfile.organizationName,
      pic: req.body.pic || userProfile.username, 
      startDate: req.body.startDate,
      deadline: req.body.deadline,
      officialLink: req.body.officialLink, 
      status: postStatus, 
    })

    const savedPost = await newPost.save()

    if (!req.user.isAdmin) {
      const admins = await User.find({ isAdmin: true });
      const notifPromises = admins.map(admin => 
        createNotification(
          admin._id,
          req.user.id,
          `Artikel baru masuk: "${req.body.title}". Mohon segera ditinjau.`,
          'POST_APPROVAL'
        )
      );
      await Promise.all(notifPromises);
    }

    res.status(201).json(savedPost)
  } catch (error) {
    next(error)
  }
}

// --- 2. GET POSTS ---
export const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0
    const limit = parseInt(req.query.limit) || 9
    const sortDirection = req.query.sort === "asc" ? 1 : -1
    const searchTerm = req.query.searchTerm?.toLowerCase()

    let currentUser = null;
    if (req.cookies && req.cookies.access_token) {
        try {
            currentUser = jwt.verify(req.cookies.access_token, process.env.JWT_SECRET);
        } catch (err) {
            currentUser = null;
        }
    }

    let queryFilters = {
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.educationLevel && req.query.educationLevel !== 'all' && { 
          criteriaEducationLevel: { $in: [req.query.educationLevel] }
      }),
    };

    const isAdmin = currentUser && currentUser.isAdmin;
    const isViewingOwnPosts = currentUser && req.query.userId === currentUser.id;

    if (isAdmin) {
        if (req.query.status) {
            queryFilters.status = req.query.status;
        }
    } else {
        if (!isViewingOwnPosts) {
            queryFilters.status = 'approved';
        }
    }

    if (searchTerm) {
        queryFilters.$or = [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } }
        ];
    }

    const posts = await Post.find(queryFilters)
        .sort({ updatedAt: sortDirection })
        .skip(startIndex)
        .limit(limit)
        // DITAMBAHKAN organizationName di sini agar frontend bisa nampilin
        .populate('userId', 'username profilePicture organizationName');

    const totalPosts = await Post.countDocuments(queryFilters); 
    
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastMonthPosts = await Post.countDocuments({ 
        ...queryFilters, 
        createdAt: { $gte: oneMonthAgo } 
    })

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    })
  } catch (error) {
    next(error)
  }
}

// --- 3. APPROVE POST ---
export const approvePost = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Hanya Admin yang dapat menyetujui artikel!"))
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set: { status: 'approved' } },
      { new: true }
    )
    await createNotification(
      updatedPost.userId,
      req.user.id,
      `Kabar baik! Artikel "${updatedPost.title}" telah disetujui dan kini sudah tayang.`,
      'POST_APPROVAL'
    );
    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}

// --- 4. DELETE POST ---
export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "Anda tidak memiliki izin menghapus artikel ini!"))
  }
  try {
    await Post.findByIdAndDelete(req.params.postId)
    res.status(200).json("Artikel berhasil dihapus!")
  } catch (error) {
    next(error)
  }
}

// --- 5. UPDATE POST ---
export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "Anda tidak memiliki izin mengedit artikel ini!"))
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
          officialLink: req.body.officialLink, 
          startDate: req.body.startDate, 
          deadline: req.body.deadline,
          criteriaEducationLevel: req.body.criteriaEducationLevel,
          criteriaMajor: req.body.criteriaMajor,
          criteriaMinGPA: req.body.criteriaMinGPA,
          criteriaLocation: req.body.criteriaLocation,
          criteriaMaxIncome: req.body.criteriaMaxIncome,
          organizationName: req.body.organizationName,
          pic: req.body.pic,
        },
      },
      { new: true }
    )
    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}