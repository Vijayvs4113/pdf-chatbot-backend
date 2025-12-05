const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askGroq(context, question) {
  const prompt = `
You are a PDF chatbot. Use ONLY the following extracted context to answer.

Context:
${context}

Question:
${question}

Answer:
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", // free + very fast
    messages: [
      { role: "system", content: "You answer based strictly on PDF context." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = { askGroq };
