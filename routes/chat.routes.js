const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Chat = require("../models/Chat");
const Pdfs = require("../models/Pdf");
const { getLocalEmbedding } = require("../services/localEmbedding");
const { askOllama } = require("../services/ollama");
const { index } = require("../config/pinecone");

router.post("/ask", auth, async (req, res) => {
  try {
    const { question, documentId, chatId } = req.body;

    if (!question || !documentId) {
      return res.status(400).json({
        message: "question and documentId are required"
      });
    }

    const queryEmbedding = await getLocalEmbedding(question);

    const searchResult = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: { documentId }   // ✅ IMPORTANT: restrict to selected PDF
    });

    const context = searchResult.matches
      .map(m => m.metadata.text)
      .join(" ");

    const answer = await askOllama(context, question);

    let chat;

    // ✅ CREATE CHAT
    if (!chatId) {
      chat = await Chat.create({
        userId: req.userId,
        documentId,
        title: question.slice(0, 30),
        messages: [
          { role: "user", text: question },
          { role: "bot", text: answer }
        ]
      });
    }
    // ✅ UPDATE CHAT
    else {
      chat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: {
            messages: [
              { role: "user", text: question },
              { role: "bot", text: answer }
            ]
          }
        },
        { new: true }
      );

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
    }

    res.json({
      answer,
      chatId: chat._id
    });

  } catch (err) {
    console.error("ASK ERROR:", err);
    res.status(500).json({ message: "Chat failed", error: err.message });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const chats = await Pdfs.find({ userId: req.userId })
      .sort({ updatedAt: 1 })
     

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "History fetch failed" });
  }
});

router.get("/history/:documentId", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.userId,
      documentId: req.params.documentId
    }).sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ message: "History load failed" });
  }
});


module.exports = router;
