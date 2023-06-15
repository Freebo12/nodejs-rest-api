const Joi = require("joi");
const User = require("../service/schema/users");
const { HttpError, sendEmail } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const regEx = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const userRegisterSchema = Joi.object({
  email: Joi.string().required().pattern(regEx),
  password: Joi.string().required().min(6),
});

const userVerifySchema = Joi.object({
  email: Joi.string().required().pattern(regEx),
});

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const verifyEmail = {
      to: email,
      subject: "Verify your email",
      html: `<a target=_blank href="${process.env.BASE_URL}/users/verify/${user.verificationCode}">Click Verify Your Email</a>`,
    };

    await sendEmail(verifyEmail);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const userRegister = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationCode = nanoid();

    const newUser = new User({
      email,
      password: hashPassword,
      avatarURL,
      verificationCode,
    });
    const verifyEmail = {
      to: email,
      subject: "Verify your email",
      html: `<a target=_blank href="${process.env.BASE_URL}/users/verify/${verificationCode}">Click Verify Your Email</a>`,
    };

    await sendEmail(verifyEmail);

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

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationCode } = req.params;
    const user = await User.findOne({ verificationCode });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user.id, {
      verify: true,
      verificationCode: "",
    });
    res.json({ message: "Verification successful" });
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

    if (!user.verify) {
      throw HttpError(401, "Email not verified");
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
  userVerifySchema,
  resendVerifyEmail,
  updateAvatar,
  verifyEmail,
};
