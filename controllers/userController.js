const userModel = require("../models/userModel");
const auth = require("../middlewares/auth");

const userRegistration = async (req, res) => {
  const data = req.body;
  try {
    const addUser = userModel.userRegistration(data);
    if (addUser) {
      return res.status(200).json({ id: addUser.id, ...data });
    }
  } catch (error) {
    console.log(error);
  }
};

const userLogin = async (req, res) => {
  try {
    // Mengambil data dari body request
    const { email_user, password } = req.body;

    // Memanggil fungsi login di userModel
    const result = await userModel.userLogin({ email_user, password });

    if (result.status === 200) {
      return res.status(200).json({
        message: result.message,
        token: result.token,
      });
    }

    // Jika login gagal
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Error saat login:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Periksa apakah pengguna adalah admin
    if (req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ message: "Access Denied: Only admins can view all users" });
    }

    // Ambil semua data pengguna
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Endpoint untuk profil pengguna
const getUserProfile = async (req, res) => {
  const id_user = req.params.id; // Mendapatkan ID dari parameter URL
  const result = await userModel.getUserProfileById(id_user);
  res.status(result.status).json(result); // Kirim respons ke klien
};

const updateUser = async (req, res) => {
  const id_user = parseInt(req.params.id); // Dapatkan `id_user` dari parameter URL
  const data = req.body; // Data yang akan diperbarui

  try {
    // Periksa apakah pengguna memiliki akses ke ID ini
    if (req.user.id_user !== id_user && req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ message: "Access denied: Unauthorized user" });
    }

    const result = await userModel.updateUserById(id_user, data);
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const deleteUser = async (req, res) => {
  const { id_user } = req.body; // Dapatkan id_user dari body request

  try {
    // Periksa apakah pengguna adalah admin
    if (req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ message: "Access Denied: Only admins can delete users" });
    }

    // Pastikan id_user dari body request disediakan
    if (!id_user) {
      return res.status(400).json({ message: "id_user is required" });
    }

    // Proses penghapusan pengguna berdasarkan id_user
    const result = await userModel.deleteUserById(id_user);

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  userRegistration,
  userLogin,
  getAllUsers,
  getUserProfile,
  updateUser,
  deleteUser,
};
