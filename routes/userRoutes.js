const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utilities");
const websiteEmailAddress = process.env.EMAIL_ADDRESS;
const websiteUrl = process.env.WEBSITE_URL;
const themeColor = process.env.THEME_MAIN;

const createToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.SEC_KEY, { expiresIn: "1d" });
};

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const userSubject = "Welcome to AG Mastering";
  const agMasteringSubject = "AG Mastering Account Creation";
  const userHtml = `
    <p>Hi ${firstName},</p>
    <p>Thank you for creating an account. You can now sign in to start a project</p>
    <a href="${websiteUrl}start-a-project"
    style="background-color: "${themeColor}";
    border: none;color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;">Start a Project</a>
  `;
  const agMasteringHtml = `
    <p>${firstName} ${lastName}, with the email ${email} has created an account with AG Mastering.</p>
  `;

  try {
    await sendEmail(email, userSubject, userHtml); // Send email to sender
    await sendEmail(websiteEmailAddress, agMasteringSubject, agMasteringHtml); // Send email notification to myself

    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({ message: `User already exists` });
    }

    // Encrypt password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate JWT token
    const token = createToken(newUser._id);

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(500).json({ message: "Error on signup:", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(400).json({ message: `Incorrect email` });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(400).json({ message: `Incorrect password` });
    }

    // Generate JWT token
    const token = createToken(foundUser._id);

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(500).json({ message: "Error on login:", error: error.message });
  }
});

router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: `Incorrect email` });
    }
    const subject = "Reset your AG Mastering password";
    const htmlContent = `
      <p>Hi ${user.firstName},</p>
      <p>A request to reset your AG Mastering password has been made.</p>
      <p>If you did not make this request, simply ignore this email. If you did make this request, please reset your password by clicking the button.</p>
      <a href="${websiteUrl}reset-password/${user._id}"
      style="background-color: ${themeColor};
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;">Reset Password</a>
    `;
    await sendEmail(email, subject, htmlContent);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error on forgotPassword:", error: error });
  }
});

router.post("/resetPassword", async (req, res) => {
  const { userId, newPassword } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  try {
    const user = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { password: hashedPassword },
      { new: true } // Return the updated user document
    );
    const subject = "AG Mastering password has been reset";
    const htmlContent = `
      <p>Hi ${user.firstName},</p>
      <p>Your password for AG Mastering has been reset.</p>
      <p>You can continue using your account with your new password.</p>
      <a href="${websiteUrl}"
      style="background-color: ${themeColor};
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;">Back to Website</a>
    `;
    await sendEmail(user.email, subject, htmlContent);
    res.status(200).json({ message: `Password reset` });
  } catch (error) {
    console.error(`Error on resetPassword: ${error}\n`);
    res.status(400).json({ message: `User doesn't exist` });
  }
});

router.post("/updateUser", async (req, res) => {
  const { userId, firstName, lastName, email, phone } = req.body;

  try {
    await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
        },
      }
    );
    res.status(200).json({ message: `User updated` });
  } catch (error) {
    console.error(`Error on updateUser: ${error}\n`);
    res.status(400).json({ message: `User doesn't exist` });
  }
});

router.get("/getUser", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: `User doesn't exist` });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
