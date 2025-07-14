const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Validate ammunition image endpoint
app.post("/api/validate-ammo", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Does this image contain ammunition, bullets, cartridges, or rounds? Answer only 'YES' or 'NO'.",
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API Error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim().toUpperCase();
    const isAmmo = answer === "YES";

    res.json({ isAmmo });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      error: "Validation failed",
      message: error.message,
    });
  }
});

// Identify ammunition endpoint
app.post("/api/identify-ammo", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ammunition image and provide detailed identification. Return your response as JSON with this exact structure:
{
  "caliber": "exact caliber/cartridge name",
  "confidence": number from 1-100,
  "description": "detailed description including case type, bullet type, manufacturer if visible, condition, etc.",
  "ballistics": "muzzle velocity, energy, effective range, and performance characteristics",
  "safety": "important safety considerations, pressure ratings, firearm compatibility warnings",
  "history": "historical background, military/civilian use, development timeline"
}

Focus on common calibers like 9mm, .223/5.56, 7.62x39, .308, .45 ACP, .22 LR, 12 gauge, .38/.357.`,
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API Error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      res.json(analysis);
    } else {
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    console.error("Identification error:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message,
    });
  }
});

// Email capture endpoint
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    console.log("New subscriber:", email);

    res.json({
      success: true,
      message: "Successfully subscribed to ballistics updates!",
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      error: "Subscription failed",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Ammo Identifier API is running",
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ammo Identifier server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠️  Warning: OPENAI_API_KEY not found in environment variables"
    );
    console.log("   Create a .env file with: OPENAI_API_KEY=your_key_here");
  } else {
    console.log("✅ OpenAI API key loaded successfully");
  }
});
