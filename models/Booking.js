const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: String,
  service: String,
  artistName: String,
  moreAboutYou: String,
  projectTitle: String,
  projectType: String,
  numberSongs: Number,
  alternateMixes: Boolean,
  songTitles: String,
  referenceTrack: String,
  referenceReason: String,
  additionalNotes: String,
  foundMe: String,
  foundMeOther: String,
});

module.exports = mongoose.model("Booking", bookingSchema);
