const Contacts = require("../service/schema/contacts");

const getContacts = async (res, req) => {
  const { _id: owner } = req.user;
  return Contacts.find({ owner });
};

const getContactById = async (id) => {
  return Contacts.findById(id);
};

const addContact = async (contact) => {
  return Contacts.create(contact);
};

const updateContact = async (id, contact) => {
  return Contacts.findByIdAndUpdate(id, contact);
};

const deleteContact = async (id) => {
  return Contacts.findByIdAndDelete(id);
};

const updateStatusContact = (id, fields) => {
  return Contacts.findByIdAndUpdate({ _id: id }, fields, { new: true });
};

module.exports = {
  getContacts,
  getContactById,
  addContact,
  updateContact,
  deleteContact,
  updateStatusContact,
};
