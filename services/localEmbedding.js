const { pipeline } = require("@xenova/transformers");

let extractor;

async function getLocalEmbedding(text) {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data); // ✅ 384-dim
}

module.exports = { getLocalEmbedding };
