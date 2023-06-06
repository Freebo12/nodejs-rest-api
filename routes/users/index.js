const express = require("express");
const router = express.Router();
const userController = require("../../controllers/users-controller");
const auth = require("../../middleware/auth");
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

module.exports = router;
