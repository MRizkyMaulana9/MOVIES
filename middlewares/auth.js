const jwt = require("jsonwebtoken");
const Secret_key = "rizext";

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Ambil token dari header
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token not found" });
  }

  try {
    const decoded = jwt.verify(token, Secret_key); // Verifikasi token
    req.getuser = decoded; // Simpan data pengguna ke `req.getuser`
    next(); // Lanjut ke handler berikutnya
  } catch (error) {
    return res
      .status(405)
      .json({ message: "Token tidak valid", error: error.message });
  }
};

module.exports = auth;
