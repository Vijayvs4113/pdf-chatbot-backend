const { Schema, model } = require("mongoose");

const chatSessionSchema = new Schema({
  userId: String,
  documentId: String,
  title: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = model("ChatSession", chatSessionSchema);
