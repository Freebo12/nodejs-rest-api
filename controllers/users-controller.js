const Joi = require("joi");
const User = require("../service/schema/users");
const { HttpError } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const regEx = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const userRegisterSchema = Joi.object({
  email: Joi.string().required().pattern(regEx),
  password: Joi.string().required().min(6),
});

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const userRegister = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const newUser = new User({
      email,
      password: hashPassword,
      avatarURL,
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

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);

  await Jimp.read(tempUpload)
    .then((avatar) => avatar.resize(250, 250).write(filename))
    .catch((err) => console.log(err));

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarUrl: avatarURL });
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  currentUser,
  userRegisterSchema,
  updateAvatar,
};
