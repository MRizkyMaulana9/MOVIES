const jwt = require("jsonwebtoken");
const Secret_key = "rizext"; // Simpan di .env untuk keamanan

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    const decoded = jwt.verify(token, Secret_key);
    req.user = decoded; // Simpan data user ke `req.user`

    // console.log("Middleware auth berhasil, user:", req.user);
    next(); // Lanjut ke controller
  } catch (error) {
    console.error("Error di middleware auth:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// Middleware khusus untuk admin
const adminAuth = (req, res, next) => {
  if (req.user.is_admin !== 1) {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
};

module.exports = { auth, adminAuth };
