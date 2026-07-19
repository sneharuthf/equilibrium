const axios = require("axios");

// Calls the Python AI microservice that performs emotion / risk analysis.
// If the microservice is unreachable, we fail safe with a neutral result
// rather than blocking the user's post from being created.
async function analyzeText({ text, userId, recentHistory = [] }) {
  const baseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  try {
    const { data } = await axios.post(
      `${baseUrl}/analyze`,
      { text, user_id: userId, recent_history: recentHistory },
      { timeout: 4000 }
    );
    return data;
  } catch (err) {
    console.error("[aiClient] AI service unavailable, using fallback:", err.message);
    return {
      emotion: "neutral",
      confidence: 0,
      mood_score: 50,
      risk_level: "none",
      indicators: [],
      recommendations: [
        "Our AI insight service is temporarily unavailable. Your post was still shared.",
      ],
    };
  }
}

module.exports = { analyzeText };
