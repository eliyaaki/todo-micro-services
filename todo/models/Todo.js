const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: Date,
});

module.exports = mongoose.model("Todo", todoSchema);
