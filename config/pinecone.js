const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

module.exports = { index };
