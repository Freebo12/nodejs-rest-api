const express = require("express");
const router = express.Router();
const contactsController = require("../../controllers/contacts-controlloer");

router.get("/", contactsController.getAllContacts);
router.get("/:id", contactsController.getContactById);
router.post("/", contactsController.addContact);
router.delete("/:id", contactsController.deleteContact);
router.put("/:id", contactsController.updateContact);

module.exports = router;
