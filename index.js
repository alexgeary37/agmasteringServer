require("dotenv").config();
const express = require("express");
const cors = require('cors');
// const path = require("path");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const PORT = process.env.PORT;
const uri = process.env.ATLAS_URI;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// app.use(express.static(path.join(__dirname, "/client/build")));
//app.use(express.static(path.join(__dirname, "client", "build")));

// Routes
app.use("/users", userRoutes);
app.use("/contacts", contactRoutes);
app.use("/bookings", bookingRoutes);
// app.get("*", (req, res) => {
  // res.sendFile(path.join(__dirname, "/client/build", "index.html"));
  // res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
