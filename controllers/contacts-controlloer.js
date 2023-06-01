const Joi = require("joi");
const service = require("../service");
const serviceContacts = require("../models/contacts");
const { HttpError } = require("../helpers");

const addContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),

  phone: Joi.string().min(3).max(15).required(),
});

const getAllContacts = async (req, res, next) => {
  try {
    const result = await service.getContacts();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.getContactById(id);
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
    const result = await service.addContact(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.deleteContact(id);
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

    const result = await service.updateContact(id, req.body);
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  const { id } = req.params;
  const { favorite = false } = req.body;

  try {
    const result = await service.updateStatusContact(id, { favorite });

    if (result) {
      if (req.body === {}) {
        console.log(req.body);
        res.status(400).json({ message: "missing field favorite" });
      }
      res.json({
        status: "success",
        code: 200,
        data: { contacts: result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${id}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  addContact,
  deleteContact,
  updateContact,
  updateStatusContact,
};
