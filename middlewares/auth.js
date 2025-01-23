const jwt = require("jsonwebtoken");
const Secret_key = "rizext";

const auth = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, Secret_key);
    req.getuser = decoded; // Simpan data pengguna dari token ke `req.getuser`

    // Periksa jika route membutuhkan akses khusus
    const userIdFromParams = req.params.id ? parseInt(req.params.id) : null;

    if (userIdFromParams && userIdFromParams !== req.getuser.id_user) {
      // Jika id user di params tidak sesuai dengan id di token, hanya admin yang diizinkan
      if (req.getuser.is_admin !== 1) {
        return res.status(403).json({
          message: "Access Denied: Admins only or unauthorized user",
        });
      }
    }

    next(); // Lanjutkan ke handler berikutnya
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

module.exports = auth;
