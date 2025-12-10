// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ---------- CHAT ROUTE (uses emotion + personality) ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { message, personality, emotion } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
You are ${personality}.
You are an AI mental wellness companion for college students.

User's detected emotion: ${emotion}.

Adapt your style:
- if sad: be extra gentle, validate feelings.
- if stressed: offer short grounding or breathing exercise plus 1–2 practical steps.
- if anxious: reassure, focus on present, suggest simple calming actions.
- if confused: clarify and ask one simple follow-up question.
- if overwhelmed: help them break things into tiny steps and remind them they don't have to do everything at once.
- if happy: be warm and encouraging.

Keep replies short, empathetic, and practical.
Avoid medical diagnoses. Encourage reaching out to trusted humans or helplines if things feel very heavy.
`;

    const result = await model.generateContent(
      `${systemPrompt}\n\nUser: ${message}`
    );

    const responseText = result.response.text();
    res.json({ reply: responseText });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({
      error: "Something went wrong while talking to Gemini.",
    });
  }
});

// ---------- EMOTION DETECTION ROUTE ----------
app.post("/api/detect-emotion", async (req, res) => {
  try {
    const { text } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Classify the user's emotion from this message into exactly one of these labels:
sad, stressed, anxious, confused, overwhelmed, happy, neutral.

Return ONLY the label, nothing else.

Message: "${text}"
`;

    const result = await model.generateContent(prompt);
    const emotionRaw = result.response.text().trim().toLowerCase();

    const allowed = [
      "sad",
      "stressed",
      "anxious",
      "confused",
      "overwhelmed",
      "happy",
      "neutral",
    ];
    const emotion = allowed.includes(emotionRaw) ? emotionRaw : "neutral";

    res.json({ emotion });
  } catch (err) {
    console.error("Emotion detect error:", err);
    res.json({ emotion: "neutral" }); // safe fallback
  }
});
app.post("/api/routine", async (req, res) => {
  try {
    const { moods } = req.body; // array of { mood, createdAt }

    const moodCounts = moods.reduce((acc, m) => {
      const key = m.mood || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const moodSummary = Object.entries(moodCounts)
      .map(([mood, count]) => `${mood}: ${count}`)
      .join(", ");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an AI assistant helping a college student plan a kind routine
based on their recent moods.

Recent mood summary (last few days):
${moodSummary}

1) Create a short daily schedule focusing on realistic study blocks and breaks.
2) Add 3-5 concrete self-care ideas that match the dominant moods.
3) Finish with a 2-3 sentence summary of encouragement.

Keep language simple, friendly, and non-judgmental.
Avoid medical advice.

Return your answer in three clear sections labeled exactly:
[ROUTINE]
[SELF_CARE]
[SUMMARY]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Very simple parsing based on markers
    const routinePart = text.split("[ROUTINE]")[1]?.split("[SELF_CARE]")[0] || "";
    const selfCarePart =
      text.split("[SELF_CARE]")[1]?.split("[SUMMARY]")[0] || "";
    const summaryPart = text.split("[SUMMARY]")[1] || "";

    res.json({
      routine: routinePart.trim(),
      selfCare: selfCarePart.trim(),
      summary: summaryPart.trim(),
    });
  } catch (err) {
    console.error("Routine error:", err);
    res.status(500).json({
      error: "Could not generate routine right now.",
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
