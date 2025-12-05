const axios = require("axios");

async function askOllama(context, question) {
  const prompt = `
You are a helpful assistant. Answer strictly using ONLY the context.

Context:
${context}

Question:
${question}

Give a short, direct answer.
`;

  const response = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt,
    stream: false,
  });

  return response.data.response;
}

module.exports = { askOllama };
