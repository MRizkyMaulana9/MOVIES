const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const auth = require("../middlewares/auth");

router.post("/pendaftaran", userController.userRegistration);
router.post("/user/login", userController.userLogin);
router.get("/alluser", auth, userController.getAllUsers);
router.get("/user/:id", auth, userController.getUserProfile);
router.put("/updatedata/:id", auth, userController.updateUser);
router.delete("/deletedata", auth, userController.deleteUser);

module.exports = router;
