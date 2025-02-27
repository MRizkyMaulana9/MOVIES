const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Secret_key = "rizext";
const userRegistration = async (data, requester) => {
  const { nama_user, email_user, nomor_telepon, password, is_admin } = data;

  if (!nama_user || !email_user || !nomor_telepon || !password) {
    return {
      status: 400,
      message: "nama_user, email_user, nomor_telepon, password are required",
    };
  }

  try {
    // Cek apakah email sudah ada di database
    const [existingUser] = await db.query(
      "SELECT email_user FROM user WHERE email_user = ?",
      [email_user]
    );

    if (existingUser.length > 0) {
      return {
        status: 400,
        message: "Email sudah digunakan. Gunakan email lain.",
      };
    }

    const saltRounds = 10;
    const newPassword = await bcrypt.hash(password, saltRounds);

    // Tentukan apakah user ini admin atau tidak
    let adminStatus = 0;
    if (is_admin !== undefined) {
      if (is_admin === 1 && (!requester || requester.is_admin !== 1)) {
        return {
          status: 403,
          message: "Access Denied: Only admins can create other admins",
        };
      }
      adminStatus = is_admin;
    }

    const [result] = await db.query(
      "INSERT INTO user (nama_user, email_user, nomor_telepon, password, is_admin) VALUES (?, ?, ?, ?, ?)",
      [nama_user, email_user, nomor_telepon, newPassword, adminStatus]
    );

    return {
      status: 201,
      message: "User registered successfully",
      data: {
        id_user: result.insertId,
        nama_user,
        email_user,
        is_admin: adminStatus,
      },
    };
  } catch (error) {
    console.error("Error in userRegistration:", error.message);
    throw { status: 500, message: "Error Detected: " + error.message };
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

    const [User] = await db.query(
      "SELECT * FROM user WHERE email_user = ? LIMIT 1",
      [email_user]
    );

    if (!User || User.length === 0) {
      return {
        status: 400,
        message: "Email tidak ditemukan",
      };
    }

    const user = User[0];

    // Verifikasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        status: 400,
        message: "Password salah",
      };
    }

    const payload = {
      id_user: user.id_user,
      nama_user: user.nama_user,
      email_user: user.email_user,
      is_admin: user.is_admin,
    };

    const token = jwt.sign(payload, Secret_key, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, Secret_key, { expiresIn: "7d" });

    return {
      status: 200,
      message: "Login berhasil",
      token: token,
      refreshToken: refreshToken,
      data: {
        id_user: user.id_user,
        nama_user: user.nama_user,
        email_user: user.email_user,
        is_admin: user.is_admin,
      },
    };
  } catch (error) {
    console.error("Error saat login:", error.message);
    return {
      status: 500,
      message: "Terjadi kesalahan pada server",
    };
  }
};

const getAllUsers = async () => {
  try {
    // Ambil semua data pengguna
    const [result] = await db.query(
      "SELECT id_user, nama_user, email_user, nomor_telepon, is_admin FROM user"
    );
    return result;
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    throw new Error("Error fetching all users");
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
        admin: result[0].is_admin,
        info: "(1) = admin, (0) = user",
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

const updateUserById = async (id_user, data) => {
  try {
    const { nama_user, email_user, nomor_telepon, password } = data;

    // Periksa apakah data untuk update disediakan
    if (!nama_user && !email_user && !nomor_telepon && !password) {
      throw new Error("No data provided for update");
    }

    // Siapkan array query untuk pembaruan
    const updates = [];
    const values = [];

    if (nama_user) {
      updates.push("nama_user = ?");
      values.push(nama_user);
    }

    if (email_user) {
      updates.push("email_user = ?");
      values.push(email_user);
    }

    if (nomor_telepon) {
      updates.push("nomor_telepon = ?");
      values.push(nomor_telepon);
    }

    if (password) {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    values.push(id_user); // Tambahkan `id_user` di akhir untuk klausa WHERE

    // Buat query SQL untuk pembaruan
    const sql = `UPDATE user SET ${updates.join(", ")} WHERE id_user = ?`;
    const [result] = await db.query(sql, values);

    // Periksa apakah ada baris yang diperbarui
    if (result.affectedRows === 0) {
      throw new Error("User not found or no changes made");
    }

    return { status: 200, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error.message);
    throw new Error("Error updating user");
  }
};

const deleteUserById = async (id_user) => {
  try {
    // Hapus data dari tabel user berdasarkan ID
    const [result] = await db.query("DELETE FROM user WHERE id_user = ?", [
      id_user,
    ]);

    // Jika tidak ada baris yang dihapus, berarti user tidak ditemukan
    if (result.affectedRows === 0) {
      return { status: 404, message: "User not found" };
    }

    return { status: 200, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error.message);
    throw new Error("Error deleting user");
  }
};

module.exports = {
  userRegistration,
  userLogin,
  getAllUsers,
  getUserProfileById,
  updateUserById,
  deleteUserById,
};
