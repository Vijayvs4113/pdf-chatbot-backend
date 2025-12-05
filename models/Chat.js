const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  documentId: { type: String, required: true },
  title: { type: String, default: "New Chat" },
  messages: [
    {
      role: { type: String, enum: ["user", "bot"], required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
