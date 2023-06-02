const express = require("express");
const router = express.Router();
const contactsController = require("../../controllers/contacts-controlloer");
const contacts = require("../../service/index");

router.get("/", contactsController.getAllContacts);
router.get("/:id", contactsController.getContactById);
router.post("/", contactsController.addContact);
router.delete("/:id", contactsController.deleteContact);
router.put("/:id", contactsController.updateContact);
router.patch("/:id/favorite", contactsController.updateStatusContact);

module.exports = router;
