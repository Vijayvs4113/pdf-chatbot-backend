const { Schema, model } = require("mongoose");

const pdfSchema = new Schema({
    userId: String,
    name: String,
    documentId: String,
    createdAt: { type: Date, default: Date.now }
});
module.exports = model("Pdf", pdfSchema);
