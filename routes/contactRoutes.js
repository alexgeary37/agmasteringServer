const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const websiteEmailAddress = process.env.EMAIL_ADDRESS;
const websiteUrl = process.env.WEBSITE_URL;
const themeColor = process.env.THEME_MAIN;
const { sendEmail } = require("../utilities");

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  const subject = "AG Mastering Contact Submission";
  const userHtml = `
    <p>Hi ${name},</p>
    <p>Your message below has been submitted and I will get back to you with a response soon :)</p>
    <p><i>${message}</i></p>
    <a href="${websiteUrl}"
    style="background-color: "${themeColor}";
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;">Back to Website</a>
  `;
  const agMasteringHtml = `
    <p>${name}, with the email, ${email} has messaged you saying:</p>
    <p><i>${message}</i></p>
  `;

  try {
    // Send emails
    await sendEmail(email, subject, userHtml); // Send email to sender
    await sendEmail(websiteEmailAddress, subject, agMasteringHtml); // Send email notification to myself

    // Add contact inquiree to db
    const newContact = new Contact({
      name,
      email,
      message,
    });
    await newContact.save();

    res
      .status(200)
      .json({ message: "Contact complete, emails sent, and added to db" });
  } catch (error) {
    res.status(500).json({ message: "Error on contact:", error: error });
  }
});

module.exports = router;
