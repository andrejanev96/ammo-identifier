const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased for multiple images
app.use(express.static("public"));

// Reference database for ammunition specifications
const ammoDatabase = {
  "9mm": {
    fullName: "9×19mm Parabellum",
    caseLength: "19.15mm",
    overallLength: "29.69mm",
    rimDiameter: "9.96mm",
    bulletDiameter: "9.02mm",
    variations: ["9mm Luger", "9mm Para", "9×19"],
    similarCartridges: [".380 ACP", ".38 Super", "9mm Makarov"],
    commonManufacturers: ["Federal", "Winchester", "Remington", "CCI"],
    headstampPatterns: ["FC", "WIN", "R-P", "PMC", "S&B"],
  },
  ".45 ACP": {
    fullName: ".45 Automatic Colt Pistol",
    caseLength: "22.8mm",
    overallLength: "32.4mm",
    rimDiameter: "12.19mm",
    bulletDiameter: "11.5mm",
    variations: [".45 Auto", ".45 ACP"],
    similarCartridges: [".45 GAP", ".45 Long Colt"],
    commonManufacturers: ["Federal", "Winchester", "Remington"],
    headstampPatterns: ["FC", "WIN", "R-P", ".45 AUTO"],
  },
  ".223 Remington": {
    fullName: ".223 Remington",
    caseLength: "44.7mm",
    overallLength: "57.4mm",
    rimDiameter: "9.6mm",
    bulletDiameter: "5.7mm",
    variations: ["5.56×45mm NATO", ".223 Rem"],
    similarCartridges: ["5.56×45mm NATO", ".222 Remington", ".224 Valkyrie"],
    commonManufacturers: ["Federal", "Winchester", "Remington", "PMC"],
    headstampPatterns: ["FC", "WIN", "R-P", "LC", "PMC"],
  },
  "5.7×28mm": {
    fullName: "5.7×28mm",
    caseLength: "28.0mm",
    overallLength: "40.5mm",
    rimDiameter: "7.9mm",
    bulletDiameter: "5.7mm",
    variations: ["5.7x28", "SS190", "SS197"],
    similarCartridges: [".22 WMR", ".17 HMR", "5.56×45mm"],
    commonManufacturers: ["FN Herstal", "Federal", "Hornady"],
    headstampPatterns: ["FN", "FC", "HORN"],
  },
  ".450 Bushmaster": {
    fullName: ".450 Bushmaster",
    caseLength: "57.4mm",
    overallLength: "70.0mm",
    rimDiameter: "12.0mm",
    bulletDiameter: "11.5mm",
    variations: [".450 BM"],
    similarCartridges: [".50 Beowulf", ".458 SOCOM", ".50 Action Express"],
    commonManufacturers: ["Hornady", "Winchester", "Remington"],
    headstampPatterns: ["HORN", "WIN", "R-P", ".450 BUSH"],
  },
  ".50 Beowulf": {
    fullName: ".50 Beowulf",
    caseLength: "57.4mm",
    overallLength: "70.0mm",
    rimDiameter: "15.0mm",
    bulletDiameter: "12.7mm",
    variations: [".50 Beo"],
    similarCartridges: [".450 Bushmaster", ".458 SOCOM", ".50 AE"],
    commonManufacturers: ["Alexander Arms", "Hornady"],
    headstampPatterns: ["AA", ".50 BEOWULF", "HORN"],
  },
  ".350 Legend": {
    fullName: ".350 Legend",
    caseLength: "34.4mm",
    overallLength: "55.0mm",
    rimDiameter: "9.6mm",
    bulletDiameter: "9.1mm",
    variations: [".350 Leg"],
    similarCartridges: [".357 Magnum", ".38 Special", ".35 Remington"],
    commonManufacturers: ["Winchester", "Federal", "Hornady"],
    headstampPatterns: ["WIN", "FC", ".350 LEGEND"],
  },
  ".357 Magnum": {
    fullName: ".357 Magnum",
    caseLength: "32.6mm",
    overallLength: "40.6mm",
    rimDiameter: "11.2mm",
    bulletDiameter: "9.1mm",
    variations: [".357 Mag"],
    similarCartridges: [".38 Special", ".350 Legend", ".38 Super"],
    commonManufacturers: ["Federal", "Winchester", "Remington"],
    headstampPatterns: ["FC", "WIN", "R-P", ".357 MAG"],
  },
};

// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Enhanced validation endpoint for multiple images
app.post("/api/validate-ammo-v2", async (req, res) => {
  try {
    const { image, type } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Enhanced prompt based on image type
    const prompts = {
      headstamp:
        "Does this close-up image show ammunition headstamp markings or the base of a cartridge? Look for text, numbers, or manufacturer markings on the base of ammunition. Answer only 'YES' or 'NO'.",
      profile:
        "Does this side-view image show a complete ammunition cartridge in profile? Look for the full cartridge shape with bullet, case, and base visible. Answer only 'YES' or 'NO'.",
      comparison:
        "Does this image show ammunition next to a size reference object (coin, ruler, etc.)? Answer only 'YES' or 'NO'.",
      base: "Does this image show the base/rim view of ammunition? Look for the bottom view showing the rim and primer. Answer only 'YES' or 'NO'.",
    };

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
                text: prompts[type] || prompts.profile,
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

    res.json({
      isAmmo,
      confidence: isAmmo ? 85 : 15,
      type: type,
    });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      error: "Validation failed",
      message: error.message,
    });
  }
});

// Enhanced identification endpoint with multi-image analysis
app.post("/api/identify-ammo-v2", async (req, res) => {
  try {
    const { images } = req.body;

    const uploadedImages = Object.entries(images).filter(
      ([type, image]) => image !== null
    );

    if (uploadedImages.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    // Analyze each image with specialized prompts
    const imageAnalyses = await Promise.all(
      uploadedImages.map(([type, image]) => analyzeImageByType(type, image))
    );

    // Combine analyses for final identification
    const finalAnalysis = await combineAnalyses(imageAnalyses, uploadedImages);

    res.json(finalAnalysis);
  } catch (error) {
    console.error("Identification error:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message,
    });
  }
});

async function analyzeImageByType(type, image) {
  const prompts = {
    headstamp: `Analyze this headstamp image and extract all visible text, numbers, and markings. Look for:
- Manufacturer codes (FC, WIN, R-P, PMC, etc.)
- Caliber markings (.45 AUTO, 9mm, .223 REM, etc.)
- Year codes or other identifiers
Return the visible text and your best caliber guess.`,

    profile: `Analyze this side-profile ammunition image for:
- Overall cartridge length (estimate relative proportions)
- Case shape (straight-walled, bottlenecked, tapered)
- Bullet type and shape
- Case-to-bullet length ratio
- Any visible crimps or features
Estimate the caliber based on proportions.`,

    comparison: `Analyze this size comparison image:
- Estimate actual cartridge dimensions using the reference object
- Compare size to common objects (penny = 19mm, quarter = 24mm)
- Calculate approximate overall length and case diameter
- Determine size category (pistol, rifle, etc.)`,

    base: `Analyze this base/rim view:
- Rim type (rimmed, rimless, rebated)
- Rim diameter relative to case
- Primer type and size
- Any visible markings around the rim
- Case head diameter estimation`,
  };

  try {
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
                text: prompts[type],
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    return {
      type,
      analysis: data.choices[0].message.content,
      confidence: 75,
    };
  } catch (error) {
    console.error(`Analysis error for ${type}:`, error);
    return {
      type,
      analysis: `Analysis failed: ${error.message}`,
      confidence: 0,
    };
  }
}

async function combineAnalyses(imageAnalyses, uploadedImages) {
  // Create comprehensive analysis prompt
  const analysisText = imageAnalyses
    .map((img) => `${img.type.toUpperCase()} ANALYSIS: ${img.analysis}`)
    .join("\n\n");

  const combinedPrompt = `Based on these multiple ammunition image analyses, provide a comprehensive identification:

${analysisText}

Cross-reference this information with the following ammunition database patterns:
${Object.entries(ammoDatabase)
  .map(
    ([caliber, data]) =>
      `${caliber}: Case length ${data.caseLength}, Overall length ${
        data.overallLength
      }, Common headstamps: ${data.headstampPatterns.join(", ")}`
  )
  .join("\n")}

Pay special attention to:
1. Headstamp text for exact identification
2. Proportional measurements from multiple angles
3. Case shape and rim type
4. Size comparisons if available

Return your response as JSON with this exact structure:
{
  "caliber": "most likely caliber identification",
  "confidence": number from 1-100 based on evidence quality,
  "description": "detailed description combining all image evidence",
  "specifications": "exact measurements and technical specs",
  "ballistics": "muzzle velocity, energy, effective range, and performance characteristics",
  "safety": "important safety considerations, pressure ratings, firearm compatibility warnings",
  "history": "historical background, military/civilian use, development timeline",
  "similarCartridges": "cartridges that could be confused with this one and how to distinguish them",
  "imageAnalysis": [
    ${imageAnalyses
      .map(
        (img) =>
          `{"type": "${img.type}", "confidence": ${img.confidence}, "notes": "key findings from this image"}`
      )
      .join(", ")}
  ]
}

Focus on accuracy over speed. If uncertain between similar cartridges, explain the distinguishing features.`;

  try {
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
            content: combinedPrompt,
          },
        ],
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);

      // Enhance with database information
      const dbInfo = findInDatabase(analysis.caliber);
      if (dbInfo) {
        analysis.specifications = `${analysis.specifications}\n\nDatabase specs: Case length: ${dbInfo.caseLength}, Overall length: ${dbInfo.overallLength}, Rim diameter: ${dbInfo.rimDiameter}`;
        analysis.similarCartridges = `${
          analysis.similarCartridges
        }\n\nOften confused with: ${dbInfo.similarCartridges.join(", ")}`;
      }

      return analysis;
    } else {
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    console.error("Combined analysis error:", error);
    throw error;
  }
}

function findInDatabase(caliber) {
  // Normalize caliber name for matching
  const normalized = caliber.toLowerCase().replace(/[^\w]/g, "");

  for (const [dbCaliber, data] of Object.entries(ammoDatabase)) {
    const dbNormalized = dbCaliber.toLowerCase().replace(/[^\w]/g, "");
    const variations = data.variations.map((v) =>
      v.toLowerCase().replace(/[^\w]/g, "")
    );

    if (
      normalized.includes(dbNormalized) ||
      dbNormalized.includes(normalized) ||
      variations.some((v) => normalized.includes(v) || v.includes(normalized))
    ) {
      return data;
    }
  }
  return null;
}

// Feedback collection endpoint
app.post("/api/feedback", async (req, res) => {
  try {
    const { isCorrect, correction, images, timestamp } = req.body;

    // In production, save to database
    console.log("Feedback received:", {
      isCorrect,
      correction,
      imageCount: Object.values(images).filter((img) => img !== null).length,
      timestamp,
    });

    res.json({ success: true, message: "Feedback recorded" });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Failed to record feedback" });
  }
});

// Email subscription endpoint
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    console.log("New subscriber:", email);

    res.json({
      success: true,
      message: "Successfully subscribed to enhanced ballistics updates!",
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
    version: "2.0",
    message: "Ammo Identifier v2.0 API is running",
    hasApiKey: !!process.env.OPENAI_API_KEY,
    features: ["multi-image-analysis", "reference-database", "feedback-system"],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 Ammo Identifier v2.0 server running on http://localhost:${PORT}`
  );
  console.log(
    `📡 Enhanced API endpoints available at http://localhost:${PORT}/api/`
  );
  console.log(
    `🔍 Features: Multi-image analysis, Reference database, Feedback system`
  );

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠️  Warning: OPENAI_API_KEY not found in environment variables"
    );
    console.log("   Create a .env file with: OPENAI_API_KEY=your_key_here");
  } else {
    console.log("✅ OpenAI API key loaded successfully");
  }
});
