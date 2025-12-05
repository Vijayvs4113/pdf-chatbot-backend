const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const { v4: uuidv4 } = require("uuid");

const Pdf = require("../models/Pdf");
const auth = require("../middleware/auth");
const { index } = require("../config/pinecone");
const { getLocalEmbedding } = require("../services/localEmbedding");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Upload PDF
router.post("/upload", auth, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received" });
    }

    const documentId = uuidv4();

    // ✅ READ FILE
    const pdfBuffer = fs.readFileSync(req.file.path);

    // ✅ FIX: Buffer → Uint8Array (this was your crash)
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer)
    });

    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(x => x.str).join(" ");
      fullText += pageText + "\n";
    }

    // ✅ DELETE FILE AFTER READ
    fs.unlinkSync(req.file.path);

    // ✅ CHUNKING
    const chunks = [];
    for (let i = 0; i < fullText.length; i += 1000) {
      chunks.push(fullText.slice(i, i + 1000));
    }

    // ✅ EMBEDDINGS + PINECONE
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getLocalEmbedding(chunks[i]);

      vectors.push({
        id: `${documentId}_${i}`,
        values: embedding,
        metadata: {
          documentId,
          chunkIndex: i,
          text: chunks[i]
        }
      });
    }

    await index.upsert(vectors);

    // ✅ STORE PDF METADATA IN MONGODB
    await Pdf.create({
      userId: req.userId,
      name: req.file.originalname,
      documentId
    });

    res.json({
      message: "PDF stored successfully",
      documentId
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      message: "PDF upload failed",
      error: err.message
    });
  }
});

// List PDFs
router.get("/", auth, async (req, res) => {
  const pdfs = await Pdf.find({ userId: req.userId });
  res.json(pdfs);
});

module.exports = router;
