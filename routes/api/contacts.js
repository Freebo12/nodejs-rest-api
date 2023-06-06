const express = require("express");
const router = express.Router();
const contactsController = require("../../controllers/contacts-controller");
const auth = require("../../middleware/auth");

router.get("/", auth, contactsController.getAllContacts);
router.get("/:id", auth, contactsController.getContactById);
router.post("/", auth, contactsController.addContact);
router.delete("/:id", auth, contactsController.deleteContact);
router.put("/:id", auth, contactsController.updateContact);
router.patch("/:id/favorite", auth, contactsController.updateStatusContact);

module.exports = router;
