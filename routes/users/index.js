const express = require("express");
const router = express.Router();
const userController = require("../../controllers/users-controller");
const auth = require("../../middleware/auth");

router.post("/register", userController.userRegister);
router.post("/login", userController.userLogin);
router.post("/logout", auth, userController.userLogout);
router.get("/current", auth, userController.currentUser);

module.exports = router;
