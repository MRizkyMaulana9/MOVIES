const db = require("../config/db"); // Sesuaikan dengan konfigurasi database Anda

const insertMovie = async ({ title, overview, backdrop_path, genre }) => {
  const query = `INSERT INTO movie_lokal (title, overview, backdrop_path, genre) VALUES (?, ?, ?, ?)`;
  const values = [title, overview, backdrop_path, genre];

  return db.execute(query, values); // Sesuaikan dengan koneksi database
};

const updateMovieById = async (id_movie, data) => {
  try {
    const { title, overview, backdrop_path, genre } = data;

    // Periksa apakah data untuk update disediakan
    if (!title && !overview && !backdrop_path && !genre) {
      throw new Error("No data provided for update");
    }

    // Siapkan array query untuk pembaruan
    const updates = [];
    const values = [];

    if (title) {
      updates.push("title = ?");
      values.push(title);
    }

    if (overview) {
      updates.push("overview = ?");
      values.push(overview);
    }

    if (backdrop_path) {
      updates.push("backdrop_path = ?");
      values.push(backdrop_path);
    }

    if (genre) {
      updates.push("genre = ?");
      values.push(genre);
    }
    values.push(id_movie); // Tambahkan `id_movie` di akhir untuk klausa WHERE

    // Buat query SQL untuk pembaruan
    const sql = `UPDATE movie_lokal SET ${updates.join(
      ", "
    )} WHERE id_movie = ?`;
    const [result] = await db.query(sql, values);

    // Periksa apakah ada baris yang diperbarui
    if (result.affectedRows === 0) {
      throw new Error("movie not found or no changes made");
    }

    return { status: 200, message: "movie updated successfully" };
  } catch (error) {
    console.error("Error updating movie:", error.message);
    throw new Error("Error updating movie");
  }
};

const deleteMovieById = async (id_movie) => {
  try {
    // Hapus data dari tabel movie_lokal berdasarkan ID
    const [result] = await db.query(
      "DELETE FROM movie_lokal WHERE id_movie = ?",
      [id_movie]
    );

    // Jika tidak ada baris yang dihapus, berarti movie tidak ditemukan
    if (result.affectedRows === 0) {
      return { status: 404, message: "Movie not found" };
    }

    return { status: 200, message: "Movie deleted successfully" };
  } catch (error) {
    console.error("Error deleting movie:", error.message);
    throw new Error("Error deleting movie");
  }
};

const getAllmovies = async () => {
  try {
    // Ambil semua data pengguna
    const [result] = await db.query(
      "SELECT id_movie, title, overview, backdrop_path from movie_lokal"
    );
    return result;
  } catch (error) {
    console.error("Error fetching all movies:", error.message);
    throw new Error("Error fetching all movies");
  }
};

const searchMovieLokalByTitle = async (title) => {
  try {
    // console.log(
    // `🛠 Query dijalankan: SELECT * FROM movie_lokal WHERE LOWER(title) LIKE LOWER('%${title}%')`
    //);

    const query = `SELECT * FROM movie_lokal WHERE LOWER(title) LIKE LOWER(?)`;
    const [rows] = await db.execute(query, [`%${title}%`]);

    // console.log("📌 Hasil Query:", rows);
    return rows;
  } catch (error) {
    // console.error("❌ Error searching movie by title:", error.message);
    throw new Error("Error searching movie by title");
  }
};

const getMovieLokalByTitle = async (title) => {
  const query = `SELECT * FROM movie_lokal WHERE LOWER(title) = LOWER(?)`;
  const [rows] = await db.execute(query, [title]);

  console.log("📌 Hasil Query Pencarian:", rows);
  return rows[0]; // Ambil movie pertama jika ada
};

// Fungsi untuk cek apakah movie sudah ada di favorit
const checkIfMovieIsFavorite = async (userId, movieId) => {
  const query = `SELECT * FROM favorite_lokalmovie WHERE id_user = ? AND id_movie = ?`;
  const [rows] = await db.execute(query, [userId, movieId]);
  return rows.length > 0; // Jika sudah ada, return true
};

const addFavoriteLokalMovie = async (movie, userId) => {
  const query = `INSERT INTO favorite_lokalmovie (id_user, id_movie, title, overview, backdrop_path, genre) VALUES (?, ?, ?, ?, ?, ?)`;
  await db.execute(query, [
    userId,
    movie.id_movie,
    movie.title,
    movie.overview,
    movie.backdrop_path,
    movie.genre,
  ]);
};

// Fungsi untuk mencari film berdasarkan genre
const getMovieLokalByGenre = async (genre) => {
  const query = `SELECT * FROM movie_lokal WHERE LOWER(genre) = LOWER(?)`;
  const [rows] = await db.execute(query, [genre]);

  console.log("📌 Hasil Query Pencarian:", rows);
  return rows; // Kembalikan semua hasil pencarian
};

const favorite_lokalmovie = {
  // Mendapatkan daftar film favorit berdasarkan ID user
  async getFavoriteMoviesByUserId(userId) {
    const query = `
      SELECT m.id_movie, m.title, m.overview, m.backdrop_path, m.genre
      FROM favorite_lokalmovie f
      JOIN movie_lokal m ON f.id_movie = m.id_movie
      WHERE f.id_user = ?;
    `;

    const [movies] = await db.execute(query, [userId]);
    return movies;
  },
};

const deletefavoritemovielokal = {
  // Menghapus film dari daftar favorit user
  async removeFavoriteMovie(userId, movieId) {
    const query = `DELETE FROM favorite_lokalmovie WHERE id_user = ? AND id_movie = ?`;
    const [result] = await db.execute(query, [userId, movieId]);
    return result.affectedRows > 0; // Return true jika berhasil dihapus
  },
};

const saveReview = async (id_user, id_movie, rating, review) => {
  // Cek jika ada parameter yang undefined atau kosong
  if (!id_user || !id_movie || !rating || !review) {
    throw new Error(
      "All fields are required: user_id, id_movie, rating, review"
    );
  }

  const query = `INSERT INTO movie_reviews (id_user, id_movie, rating, review) VALUES (?, ?, ?, ?)`; // Gunakan id_movie

  try {
    const [result] = await db.execute(query, [
      id_user,
      id_movie,
      rating,
      review,
    ]);
    return result;
  } catch (error) {
    console.error("❌ Error di saveReview:", error.message);
    throw new Error("Database error: Failed to save review");
  }
};

// ✅ Fungsi untuk mengambil review berdasarkan id_movie
const getReviewsByMovie = async (id_movie) => {
  const query = `
    SELECT id_user, id_movie, rating, review, created_at
    FROM movie_reviews
    WHERE id_movie = ?
    ORDER BY created_at DESC`; // Urutkan berdasarkan tanggal terbaru

  try {
    const [rows] = await db.execute(query, [id_movie]);
    return rows;
  } catch (error) {
    console.error("❌ Error di getReviewsByMovie:", error.message);
    throw new Error("Database error: Failed to fetch reviews");
  }
};

module.exports = {
  insertMovie,
  updateMovieById,
  deleteMovieById,
  getAllmovies,
  searchMovieLokalByTitle,
  getMovieLokalByTitle,
  checkIfMovieIsFavorite,
  addFavoriteLokalMovie,
  getMovieLokalByGenre,
  favorite_lokalmovie,
  deletefavoritemovielokal,
  saveReview,
  getReviewsByMovie,
};
