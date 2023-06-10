const express = require("express");
const router = express.Router();
const userController = require("../../controllers/users-controller");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const validateBody = require("../../middleware/validateBody");
const { userRegisterSchema } = require("../../controllers/users-controller");

router.post(
  "/register",
  validateBody(userRegisterSchema),
  userController.userRegister
);

router.post(
  "/login",
  validateBody(userRegisterSchema),
  userController.userLogin
);

router.post("/logout", auth, userController.userLogout);

router.get("/current", auth, userController.currentUser);

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  userController.updateAvatar
);

module.exports = router;
