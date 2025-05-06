// server.js
const SYSTEM_PROMPT = `
You are an expert automotive technician.
Answer concisely in plain‐text bullet points (use “- ” for each item).
Do NOT use any Markdown syntax (no **bold**, no *asterisks*).
Give exactly 3 possible causes, each in one sentence, with one quick home test.
`;
require('dotenv').config();

const express       = require('express');
const path          = require('path');
const { GoogleGenAI } = require('@google/genai');

const app   = express();
const port  = process.env.PORT || 3001;

// ── Initialize with API key ONLY ───────────────────────────────────────────
const ai = new GoogleGenAI({
  apiKey: process.env.AI_STUDIO_API_KEY,  
});
// :contentReference[oaicite:0]{index=0}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [
          SYSTEM_PROMPT.trim(),
          message.trim()
        ],
      parameters: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    });

    const reply = response.text
      || (response.candidates && response.candidates[0]?.content)
      || 'Sorry, I could not generate a response.';
    let clean = reply
      .replace(/\*\*/g, '')        // remove all ** bold markers
      .replace(/^\*\s+/gm, '- \n');  // turn leading "* " into "- "

    res.json({ reply });

  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

app.listen(port, () => {
  console.log(`🚗 FixMyRide AI server running at http://localhost:${port}`);
});
