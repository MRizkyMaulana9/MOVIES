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

// Rute untuk Mendapatkan Semua User (Admin Only)
const getUsers = async (req, res) => {
  if (req.getuser.is_admin === 0) {
    return res.status(403).json({ message: "Access Denied: Admins only" });
  }

  try {
    const users = await userModel.getUser();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Endpoint untuk profil pengguna
const getUserProfile = async (req, res) => {
  const id_user = req.params.id; // Mendapatkan ID dari parameter URL
  const result = await userModel.getUserProfileById(id_user);
  res.status(result.status).json(result); // Kirim respons ke klien
};
module.exports = { userRegistration, userLogin, getUsers, getUserProfile };
