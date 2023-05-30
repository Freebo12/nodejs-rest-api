const Joi = require("joi");
const serviceContacts = require("../models/contacts");
const { HttpError } = require("../helpers");

const addContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),

  phone: Joi.string().min(3).max(15).required(),
});

const getAllContacts = async (req, res, next) => {
  try {
    const result = await serviceContacts.listContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await serviceContacts.getContactById(id);
    if (!result) {
      throw HttpError(404, "contact not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { error } = addContactSchema.validate(req.body);

    if (error) {
      throw HttpError(400, error.message);
    }
    const result = await serviceContacts.addContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await serviceContacts.removeContact(id);
    if (!result) {
      console.log(id);
      throw HttpError(404, "Not found");
    }
    res.json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = addContactSchema.validate(req.body);

    if (error) {
      throw HttpError(400, error.message);
    }

    const result = await serviceContacts.updateContact(id, req.body);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  addContact,
  deleteContact,
  updateContact,
};
