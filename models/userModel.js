const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Secret_key = "rizext";
const userRegistration = async (data) => {
  const { nama_user, email_user, nomor_telepon, password, is_admin } = data;

  // Validasi input
  if (!nama_user || !email_user || !nomor_telepon || !password) {
    return "nama_user, email_user, nomor_telepon, password are required";
  }

  try {
    const salt = 10;
    const newPassword = await bcrypt.hash(password, salt);

    // Jika is_admin tidak disertakan, defaultkan ke 0 (user biasa)
    const adminStatus = is_admin === undefined ? 0 : is_admin;

    // Menyisipkan data ke dalam tabel user
    const [result] = await db.query(
      "INSERT INTO user (nama_user, email_user, nomor_telepon, password, is_admin) VALUES (?, ?, ?, ?, ?)",
      [nama_user, email_user, nomor_telepon, newPassword, adminStatus]
    );

    return { id_user: result.insertId, pass: newPassword };
  } catch (error) {
    console.error("Error in userRegistration:", error.message);
    throw new Error("Error Detected");
  }
};

const userLogin = async (data) => {
  try {
    const { email_user, password } = data;

    if (!email_user || !password) {
      return {
        status: 400,
        message: "Email dan Password wajib diisi",
      };
    }

    // Query database untuk mendapatkan pengguna berdasarkan email
    const [getUser] = await db.query(
      "SELECT * FROM user WHERE email_user = ?",
      [email_user]
    );

    if (getUser.length > 0) {
      const user = getUser[0];

      // Verifikasi password menggunakan bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Membuat payload untuk token JWT
        const payload = {
          id_user: user.id_user,
          nama_user: user.nama_user,
          email_user: user.email_user,
        };

        // Membuat token JWT
        const token = jwt.sign(payload, Secret_key, { expiresIn: "1h" });
        return {
          status: 200,
          message: "Login berhasil",
          token: token,
        };
      }

      return {
        status: 400,
        message: "Password salah",
      };
    }

    return {
      status: 400,
      message: "Email tidak ditemukan",
    };
  } catch (error) {
    console.error("Error saat login:", error.message);
    return {
      status: 500,
      message: "Terjadi kesalahan pada server",
    };
  }
};

const getUser = async () => {
  try {
    const [result] = await db.query("select * from user");
    return result;
  } catch (error) {
    console.log(error);
  }
};

const getUserProfileById = async (data) => {
  try {
    // Validasi input
    const id_user = data;
    if (!id_user) {
      return {
        status: 400,
        message: "ID User tidak valid",
      };
    }

    // Query ke database
    const [result] = await db.query("SELECT * FROM user WHERE id_user = ?", [
      id_user,
    ]);

    // Jika data tidak ditemukan
    if (!result || !Array.isArray(result) || result.length === 0) {
      return {
        status: 404,
        message: "User tidak ditemukan",
      };
    }

    // Jika data ditemukan, kembalikan profil user
    return {
      status: 200,
      data: {
        nama_user: result[0].nama_user,
        email_user: result[0].email_user,
        nomor_telepon: result[0].nomor_telepon,
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return {
      status: 500,
      message: "Terjadi kesalahan server",
    };
  }
};

module.exports = { userRegistration, userLogin, getUser, getUserProfileById };
