const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const stripe = require("stripe")(process.env.STRIPE_SK_LIVE);
const websiteEmailAddress = process.env.EMAIL_ADDRESS;
const websiteUrl = process.env.WEBSITE_URL;
const {
  sendEmail,
  getUserEmailHtml,
  getAGMasteringEmailHtml,
} = require("../utilities");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

// Require authentication for all booking routes
router.use(requireAuth);

router.post("/testProcessPayment", (req, res) => {
  try {
    const { paymentMethodId, quote, service } = req.body;

    // Simulate a successful payment processing
    res.json({
      status: "success",
      message: "Payment processed successfully",
      data: { paymentMethodId, quote, service },
    });
  } catch (error) {
    console.error("Error on testProcessPayment:", error);
    res.json({ message: "Error on testProcessPayment", error: error });
  }
});

router.post("/processPayment", async (req, res) => {
  try {
    const { paymentMethodId, quote, service } = req.body;
    const amount = quote * 100; // Get amount in cents

    // Create a PaymentIntent on the backend
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethodId,
      amount: amount, // Example amount in cents
      currency: "usd",
      description: service,
      confirmation_method: "manual",
      confirm: true,
      return_url: `${websiteUrl}/payment-success`,
    });

    // Handle payment success or failure
    if (paymentIntent.status === "succeeded") {
      res.status(200).json({ message: "Payment succeeded" });
    } else {
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Error on processPayment", error: error });
  }
});

router.post("/sendBookingEmails", async (req, res) => {
  try {
    const { userEmail, service, formData } = req.body;

    const userSubject = "AG Mastering Payment Confirmation";
    const agMasteringSubject = "AG Mastering New Purchase";

    const user = await User.findOne({ email: userEmail });
    const userHtml = getUserEmailHtml(user.firstName, service, formData);
    const agMasteringHtml = getAGMasteringEmailHtml(
      user.firstName,
      user.lastName,
      userEmail,
      service,
      formData
    );

    await sendEmail(userEmail, userSubject, userHtml);
    await sendEmail(websiteEmailAddress, agMasteringSubject, agMasteringHtml);

    formData.userId = user._id;
    formData.service = service;

    // Add booking to db
    const newBooking = new Booking(formData);
    await newBooking.save();

    res
      .status(200)
      .json({ message: "Booking emails sent, and Booking added to db" });
  } catch (error) {
    console.error("Error sending booking emails:", error);
    res
      .status(500)
      .json({ message: "Error on sendBookingEmails:", error: error });
  }
});

module.exports = router;
