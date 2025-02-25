import OpenAI from "openai";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4-0125-preview";
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || "30000", 10);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: API_TIMEOUT,
});

export const createMessages = async (text, type) => {
  try {
    // Validate input
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input text");
    }

    const systemPrompt = type === "finance"
      ? "WealthWhisperer is your personal financial guru, leveraging proprietary data and sophisticated algorithms to deliver tailored financial advice, empowering you to make informed decisions for a prosperous future."
      : "You are a chatbot, Please reply politely to the following questions.";

    const messages = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text.trim(),
        },
      ],
    });

    // Avoid logging full response content
    console.log(`Received response from OpenAI (${messages.id})`);
    return messages.choices[0].message.content;
  } catch (e) {
    console.error("OpenAI API error:", e.name, e.message);
    return null;
  }
};
