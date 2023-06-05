const Joi = require("joi");
const User = require("../service/schema/users");
const { HttpError } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const regEx = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const userRegisterSchema = Joi.object({
  email: Joi.string().required().pattern(regEx),
  password: Joi.string().required().min(6),
});

const userRegister = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashPassword,
    });
    const savedUser = await newUser.save();
    res.status(201).json({
      user: {
        email: savedUser.email,
        subscription: savedUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(401, "Not authorized");
    }

    const PasswordCompare = await bcrypt.compare(password, user.password);
    if (!PasswordCompare) {
      throw HttpError(400, "Email or password is wrong");
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, `${process.env.SECRET_KEY}`, {
      expiresIn: "23h",
    });
    await User.findByIdAndUpdate(user.id, { token });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const userLogout = async (req, res, next) => {
  const { id } = req.user;
  await User.findByIdAndUpdate(id, { token: "" });

  res.status(204).json({ message: "User logged out" });
};

const currentUser = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  currentUser,
  userRegisterSchema,
};
