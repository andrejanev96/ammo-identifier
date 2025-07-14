// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("Ammo Identifier v2.0 - Frontend loaded");
  initializeApp();
});

function initializeApp() {
  // State management
  const uploadedImages = {
    headstamp: null,
    profile: null,
    comparison: null,
    base: null,
  };

  // DOM elements
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const uploadAreas = document.querySelectorAll(".upload-area");
  const fileInputs = document.querySelectorAll(".file-input");
  const uploadCount = document.getElementById("uploadCount");
  const progressFill = document.getElementById("progressFill");
  const validationSection = document.getElementById("validationSection");
  const validationChecking = document.getElementById("validationChecking");
  const validationResults = document.getElementById("validationResults");
  const validationError = document.getElementById("validationError");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultsSection = document.getElementById("resultsSection");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const resultsContent = document.getElementById("resultsContent");

  // Check API connection on startup
  checkApiConnection();

  async function checkApiConnection() {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();

      if (data.status === "OK" && data.hasApiKey) {
        statusDot.className = "status-dot connected";
        statusText.textContent =
          "AI service connected and ready (v2.0 Enhanced)";
      } else if (data.status === "OK" && !data.hasApiKey) {
        statusDot.className = "status-dot error";
        statusText.textContent = "Server connected - API key missing";
      } else {
        throw new Error("Service unavailable");
      }
    } catch (error) {
      statusDot.className = "status-dot error";
      statusText.textContent = "Service unavailable";
      console.error("API connection check failed:", error);
    }
  }

  // Setup upload areas
  uploadAreas.forEach(setupUploadArea);
  fileInputs.forEach(setupFileInput);

  function setupUploadArea(uploadArea) {
    const type = uploadArea.dataset.type;
    const fileInput = uploadArea.querySelector(".file-input");

    // Click to upload
    uploadArea.addEventListener("click", (e) => {
      if (e.target.closest(".remove-btn")) return;
      fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0], type, uploadArea);
      }
    });

    // Remove button
    const removeBtn = uploadArea.querySelector(".remove-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeImage(type, uploadArea);
      });
    }
  }

  function setupFileInput(fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        const type = fileInput.dataset.type;
        const uploadArea = fileInput.closest(".upload-area");
        handleFileUpload(e.target.files[0], type, uploadArea);
      }
    });
  }

  function handleFileUpload(file, type, uploadArea) {
    console.log("Processing file:", file.name, "Type:", type);

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      // Store image data
      uploadedImages[type] = e.target.result;

      // Update UI
      showImagePreview(uploadArea, e.target.result);
      updateProgress();
      checkValidation();
    };
    reader.readAsDataURL(file);
  }

  function showImagePreview(uploadArea, imageData) {
    const previewContainer = uploadArea.querySelector(
      ".image-preview-container"
    );
    const preview = uploadArea.querySelector(".image-preview");
    const uploadContent = uploadArea.querySelector(".upload-content");

    preview.src = imageData;
    previewContainer.style.display = "block";
    uploadContent.style.display = "none";
    uploadArea.classList.add("has-image");
  }

  function removeImage(type, uploadArea) {
    uploadedImages[type] = null;

    const previewContainer = uploadArea.querySelector(
      ".image-preview-container"
    );
    const uploadContent = uploadArea.querySelector(".upload-content");
    const fileInput = uploadArea.querySelector(".file-input");

    previewContainer.style.display = "none";
    uploadContent.style.display = "block";
    uploadArea.classList.remove("has-image");
    fileInput.value = "";

    updateProgress();
    resetValidation();
  }

  function updateProgress() {
    const uploadedCount = Object.values(uploadedImages).filter(
      (img) => img !== null
    ).length;
    uploadCount.textContent = uploadedCount;
    progressFill.style.width = `${(uploadedCount / 4) * 100}%`;

    // Enable analyze button if at least one image
    analyzeBtn.disabled = uploadedCount === 0;
  }

  async function checkValidation() {
    const uploadedCount = Object.values(uploadedImages).filter(
      (img) => img !== null
    ).length;
    if (uploadedCount === 0) return;

    validationSection.style.display = "block";
    validationChecking.style.display = "block";
    validationResults.style.display = "none";
    validationError.style.display = "none";

    try {
      const validationPromises = Object.entries(uploadedImages)
        .filter(([type, image]) => image !== null)
        .map(([type, image]) => validateImage(image, type));

      const results = await Promise.all(validationPromises);
      showValidationResults(results);
    } catch (error) {
      showValidationError(error.message);
    }
  }

  async function validateImage(imageData, type) {
    try {
      const response = await fetch("/api/validate-ammo-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, type: type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const data = await response.json();
      return { type, ...data };
    } catch (error) {
      console.error(`Validation error for ${type}:`, error);
      return { type, isAmmo: false, confidence: 0, error: error.message };
    }
  }

  function showValidationResults(results) {
    validationChecking.style.display = "none";

    const ammoResults = results.filter((r) => r.isAmmo);
    const hasValidAmmo = ammoResults.length > 0;

    if (hasValidAmmo) {
      validationResults.style.display = "block";
      const summary = document.getElementById("validationSummary");
      summary.innerHTML = `
                <p><strong>✓ Ammunition detected in ${
                  ammoResults.length
                } image(s)</strong></p>
                <div class="validation-breakdown">
                    ${results
                      .map(
                        (r) => `
                        <div class="validation-item">
                            <span class="validation-type">${r.type}:</span>
                            <span class="validation-status ${
                              r.isAmmo ? "valid" : "invalid"
                            }">
                                ${
                                  r.isAmmo
                                    ? "✓ Ammo detected"
                                    : "✗ No ammo detected"
                                }
                            </span>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;
    } else {
      validationError.style.display = "block";
      document.getElementById("errorDetails").textContent =
        "No ammunition detected in uploaded images. Please ensure images clearly show ammunition.";
    }
  }

  function showValidationError(message) {
    validationChecking.style.display = "none";
    validationError.style.display = "block";
    document.getElementById("errorDetails").textContent = message;
  }

  function resetValidation() {
    validationSection.style.display = "none";
  }

  // Analysis button
  analyzeBtn.addEventListener("click", async function () {
    console.log("Starting enhanced analysis...");
    resultsSection.style.display = "block";
    loadingIndicator.style.display = "block";
    resultsContent.style.display = "none";

    try {
      const analysis = await identifyAmmunition();
      showResults(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      loadingIndicator.style.display = "none";
      alert("Analysis failed: " + error.message);
      resultsSection.style.display = "none";
    }
  });

  async function identifyAmmunition() {
    try {
      const response = await fetch("/api/identify-ammo-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploadedImages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Identification API error:", error);
      throw new Error("Unable to analyze ammunition. Please try again.");
    }
  }

  function showResults(analysis) {
    loadingIndicator.style.display = "none";
    resultsContent.style.display = "block";

    // Main identification
    document.getElementById(
      "identificationTitle"
    ).textContent = `${analysis.caliber} Identified`;
    document.getElementById(
      "confidenceBar"
    ).style.width = `${analysis.confidence}%`;
    document.getElementById(
      "confidenceText"
    ).textContent = `Overall Confidence: ${analysis.confidence}%`;

    // Analysis breakdown
    const breakdown = document.getElementById("analysisBreakdown");
    breakdown.innerHTML = `
            <h4>Analysis Breakdown:</h4>
            ${
              analysis.imageAnalysis
                ? analysis.imageAnalysis
                    .map(
                      (img) => `
                <div class="breakdown-item">
                    <strong>${img.type}:</strong> ${img.confidence}% confidence - ${img.notes}
                </div>
            `
                    )
                    .join("")
                : ""
            }
        `;

    // Results cards
    document.getElementById("identificationDetails").textContent =
      analysis.description;
    document.getElementById("specificationsData").textContent =
      analysis.specifications;
    document.getElementById("ballisticsData").textContent = analysis.ballistics;
    document.getElementById("safetyNotes").textContent = analysis.safety;
    document.getElementById("historicalInfo").textContent = analysis.history;
    document.getElementById("similarCartridges").textContent =
      analysis.similarCartridges;
  }

  // Feedback system
  const correctBtn = document.getElementById("correctBtn");
  const incorrectBtn = document.getElementById("incorrectBtn");
  const correctionForm = document.getElementById("correctionForm");
  const submitCorrection = document.getElementById("submitCorrection");

  correctBtn.addEventListener("click", () => {
    submitFeedback(true);
  });

  incorrectBtn.addEventListener("click", () => {
    correctionForm.style.display = "block";
  });

  submitCorrection.addEventListener("click", () => {
    const correction = document.getElementById("correctionInput").value;
    if (correction.trim()) {
      submitFeedback(false, correction);
      correctionForm.style.display = "none";
    }
  });

  async function submitFeedback(isCorrect, correction = null) {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCorrect,
          correction,
          images: uploadedImages,
          timestamp: new Date().toISOString(),
        }),
      });

      alert(
        isCorrect
          ? "Thank you for confirming!"
          : "Thank you for the correction!"
      );
    } catch (error) {
      console.error("Feedback submission failed:", error);
    }
  }

  // Email capture
  const emailBtn = document.getElementById("emailBtn");
  emailBtn.addEventListener("click", async function () {
    const email = document.getElementById("emailInput").value;

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      emailBtn.disabled = true;
      emailBtn.textContent = "Subscribing...";

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        document.getElementById("emailInput").value = "";
      } else {
        throw new Error(data.message || "Subscription failed");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Subscription failed: " + error.message);
    } finally {
      emailBtn.disabled = false;
      emailBtn.textContent = "Subscribe";
    }
  });

  console.log("App v2.0 initialized successfully!");
}
