const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const auth = require("../middlewares/auth");

router.post("/pendaftaran", userController.userRegistration);
router.post("/user/login", userController.userLogin);
router.get("/alluser", userController.getUsers);
router.get("/user/:id", auth, userController.getUserProfile);
module.exports = router;
