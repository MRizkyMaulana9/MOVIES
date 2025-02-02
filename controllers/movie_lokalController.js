const { title } = require("process");
const {
  insertMovie,
  updateMovieById,
  deleteMovieById,
  getAllmovies,
  searchMovieLokalByTitle,
  checkIfMovieIsFavorite,
  addFavoriteLokalMovie,
  getMovieLokalByTitle,
  getMovieLokalByGenre,
  favorite_lokalmovie,
  deletefavoritemovielokal,
  saveReview,
  getReviewsByMovie,
} = require("../models/movie_lokalModel");
const path = require("path");

const addMovie = async (req, res) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    const { title, overview, genre } = req.body;
    const file = req.file;

    // Validasi input
    if (!title || !overview || !file || !genre) {
      return res
        .status(400)
        .json({ message: "All fields are required, including file" });
    }

    // Simpan path file ke database
    const backdrop_path = path.join("/uploads", file.filename);

    // Masukkan data ke database
    await insertMovie({ title, overview, backdrop_path, genre });

    res.status(201).json({ message: "Movie added successfully" });
  } catch (error) {
    console.error("Error adding movie:", error.message);
    res
      .status(500)
      .json({ message: "Failed to add movie", error: error.message });
  }
};

const updateMovie = async (req, res) => {
  const id_movie = parseInt(req.params.id); // Dapatkan `id_movie` dari parameter URL
  const data = req.body; // Data yang akan diperbarui

  try {
    // Pastikan hanya admin yang dapat mengupdate movie
    if (req.user.is_admin !== 1) {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    // Panggil fungsi untuk memperbarui data film berdasarkan ID
    const result = await updateMovieById(id_movie, data);

    // Jika berhasil, kirimkan status dan pesan
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    // Jika terjadi error saat proses update
    console.error("Error in updateMovie:", error.message);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const deleteMovie = async (req, res) => {
  const { id_movie } = req.body; // Dapatkan id_movie dari body request

  try {
    // Periksa apakah pengguna adalah admin
    if (req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ message: "Access Denied: Only admins can delete users" });
    }

    // Pastikan id_movie dari body request disediakan
    if (!id_movie) {
      return res.status(400).json({ message: "id_movie is required" });
    }

    // Proses penghapusan pengguna berdasarkan id_movie
    const result = await deleteMovieById(id_movie);

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Error in deleteMovie:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getAllmovie = async (req, res) => {
  try {
    // Ambil semua data film
    const users = await getAllmovies();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all movies:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const searchMovieLokal = async (req, res) => {
  try {
    let { title } = req.query;

    if (!title) {
      return res.status(400).json({ message: "Title query is required" });
    }

    title = title.trim(); // Hapus spasi di awal & akhir

    //console.log(`🔍 Mencari film dengan judul: '${title}'`);

    const movies = await searchMovieLokalByTitle(title);

    if (movies.length === 0) {
      //console.log("🚫 Tidak ada film ditemukan.");
      return res.status(404).json({ message: "No movies found" });
    }

    //console.log("✅ Film ditemukan:", movies);
    return res.status(200).json({ movies });
  } catch (error) {
    console.error("❌ Error in searchMovieLokal:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const addFavoriteLokalMovies = async (req, res) => {
  const { title } = req.body;
  const userId = req.user.id_user;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const movie = await getMovieLokalByTitle(title.trim());

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Cek apakah movie sudah ada di daftar favorit pengguna
    const isFavorite = await checkIfMovieIsFavorite(userId, movie.id_movie);
    if (isFavorite) {
      return res.status(400).json({ message: "Movie is already in favorites" });
    }

    // Jika belum ada, tambahkan ke favorit
    await addFavoriteLokalMovie(movie, userId);

    return res.status(201).json({
      message: "Movie has been added to your favorites",
      movie: {
        title: movie.title,
        overview: movie.overview,
        backdrop_path: movie.backdrop_path,
        genre: movie.genre,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add movie to favorites",
      error: error.message,
    });
  }
};

const getmovielokalgenre = async (req, res) => {
  console.log("getmovielokalgenre...");

  // Ambil genre dari query params
  const { genre } = req.query;
  console.log("Genre yang dicari:", genre);

  if (!genre) {
    console.log("❌ Genre tidak ditemukan");
    return res.status(400).json({ message: "Genre is required" });
  }

  try {
    console.log(`🔍 Mencari film dengan genre: '${genre}'`);

    // Cari movie berdasarkan genre
    const movies = await getMovieLokalByGenre(genre.trim());

    if (movies.length === 0) {
      console.log("🚫 Film tidak ditemukan.");
      return res
        .status(404)
        .json({ message: "No movies found for this genre" });
    }

    return res.status(200).json({
      message: "Movies found",
      movies: movies, // Kirim semua film yang ditemukan
    });
  } catch (error) {
    console.error("❌ Error di getmovielokalgenre:", error.message);
    return res.status(500).json({
      message: "Failed to fetch movies by genre",
      error: error.message,
    });
  }
};

const getFavoriteMovies = async (req, res) => {
  console.log("📌 Menampilkan daftar film favorit...");

  try {
    const userId = req.user.id_user; // Ambil ID user dari token
    console.log(`🔍 Mencari favorit untuk user ID: ${userId}`);

    const movies = await favorite_lokalmovie.getFavoriteMoviesByUserId(userId);

    if (movies.length === 0) {
      console.log("🚫 Tidak ada film favorit.");
      return res.status(404).json({ message: "No favorite movies found" });
    }

    return res.status(200).json({
      message: "Favorite movies retrieved successfully",
      movies: movies,
    });
  } catch (error) {
    console.error("❌ Error di getFavoriteMovies:", error.message);
    return res.status(500).json({
      message: "Failed to fetch favorite movies",
      error: error.message,
    });
  }
};

const removeFavoritelokalMovie = async (req, res) => {
  console.log("📌 Menghapus film favorit...");

  try {
    const userId = req.user.id_user; // ID user dari token
    const { movieId } = req.params; // ID film dari parameter URL

    console.log(
      `🗑 Menghapus film ID: ${movieId} dari favorit user ID: ${userId}`
    );

    const isDeleted = await deletefavoritemovielokal.removeFavoriteMovie(
      userId,
      movieId
    );

    if (!isDeleted) {
      console.log("🚫 Film favorit tidak ditemukan atau gagal dihapus.");
      return res
        .status(404)
        .json({ message: "Favorite movie not found or already removed" });
    }

    return res
      .status(200)
      .json({ message: "Favorite movie removed successfully" });
  } catch (error) {
    console.error("❌ Error di removeFavoriteMovie:", error.message);
    return res.status(500).json({
      message: "Failed to remove favorite movie",
      error: error.message,
    });
  }
};

// reviewController.js
const addReview = async (req, res) => {
  try {
    console.log("🔹 addReview API dipanggil");

    // Ambil data dari request body
    const { id_movie, rating, review } = req.body;
    const user_id = req.user.id_user; // ID user dari token

    console.log("📌 Data yang diterima:", {
      user_id,
      id_movie,
      rating,
      review,
    });

    // Validasi input
    if (!id_movie || !rating || !review) {
      console.log("❌ Data tidak lengkap");
      return res
        .status(400)
        .json({ message: "Movie ID, rating, and review are required" });
    }

    // Simpan review ke database
    await saveReview(user_id, id_movie, rating, review);

    console.log("✅ Review berhasil ditambahkan");
    return res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("❌ Error di addReview:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to add review", error: error.message });
  }
};

const getMovieReviews = async (req, res) => {
  try {
    console.log("🔹 getMovieReviews API dipanggil");

    // Ambil id_movie dari query params
    const { id_movie } = req.query;

    if (!id_movie) {
      console.log("❌ Movie ID tidak ditemukan");
      return res.status(400).json({ message: "Movie ID is required" });
    }

    // Ambil data review dari database
    const reviews = await getReviewsByMovie(id_movie);

    if (reviews.length === 0) {
      console.log("🚫 Tidak ada review untuk film ini.");
      return res
        .status(404)
        .json({ message: "No reviews found for this movie" });
    }

    console.log("✅ Review berhasil ditemukan:", reviews);
    return res.status(200).json({
      message: "Reviews found",
      reviews: reviews, // Kirim semua review yang ditemukan
    });
  } catch (error) {
    console.error("❌ Error di getMovieReviews:", error.message);
    return res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

module.exports = {
  addMovie,
  updateMovie,
  deleteMovie,
  getAllmovie,
  searchMovieLokal,
  addFavoriteLokalMovies,
  getmovielokalgenre,
  getFavoriteMovies,
  removeFavoritelokalMovie,
  addReview,
  getMovieReviews,
};
