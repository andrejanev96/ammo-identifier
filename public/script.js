// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("Ammo Identifier - Frontend loaded");
  initializeApp();
});

function initializeApp() {
  // Get DOM elements
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultsSection = document.getElementById("resultsSection");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const resultsContent = document.getElementById("resultsContent");
  const emailBtn = document.getElementById("emailBtn");
  const removeBtn = document.getElementById("removeBtn");
  const reuploadBtn = document.getElementById("reuploadBtn");
  const uploadSuccess = document.getElementById("uploadSuccess");
  const validationError = document.getElementById("validationError");
  const validationChecking = document.getElementById("validationChecking");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  // Check API connection on startup
  checkApiConnection();

  async function checkApiConnection() {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();

      if (data.status === "OK" && data.hasApiKey) {
        statusDot.className = "status-dot connected";
        statusText.textContent = "AI service connected and ready";
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

  // Upload area click handler
  uploadArea.addEventListener("click", function (e) {
    if (e.target.closest(".remove-btn") || e.target.closest(".reupload-btn")) {
      return;
    }
    fileInput.click();
  });

  // Drag and drop handlers
  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", function (e) {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  // File input handler
  fileInput.addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Handle file upload
  async function handleFile(file) {
    console.log("Processing file:", file.name, file.type);

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
      // Show image preview
      imagePreview.src = e.target.result;
      imagePreviewContainer.style.display = "block";

      // Hide upload prompt
      document.querySelector(".upload-icon").style.display = "none";
      document.querySelector(".upload-text").style.display = "none";
      document.querySelector(".upload-subtext").style.display = "none";

      // Start validation
      validationChecking.style.display = "block";
      uploadSuccess.style.display = "none";
      validationError.style.display = "none";
      analyzeBtn.disabled = true;

      try {
        console.log("Starting validation...");
        const isAmmo = await validateAmmoImage(e.target.result);
        console.log("Validation result:", isAmmo);

        validationChecking.style.display = "none";

        if (isAmmo) {
          uploadSuccess.style.display = "block";
          validationError.style.display = "none";
          analyzeBtn.disabled = false;
        } else {
          uploadSuccess.style.display = "none";
          validationError.style.display = "block";
          analyzeBtn.disabled = true;
        }
      } catch (error) {
        console.error("Validation error:", error);
        validationChecking.style.display = "none";
        validationError.style.display = "block";
        validationError.querySelector("h4").textContent = "⚠️ Validation Error";
        validationError.querySelector("p").textContent = error.message;
        analyzeBtn.disabled = true;
      }
    };
    reader.readAsDataURL(file);
  }

  // AI validation function
  async function validateAmmoImage(imageData) {
    try {
      const response = await fetch("/api/validate-ammo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const data = await response.json();
      return data.isAmmo;
    } catch (error) {
      console.error("Validation API error:", error);
      throw new Error("Unable to validate image. Please try again.");
    }
  }

  // AI identification function
  async function identifyAmmunition(imageData) {
    try {
      const response = await fetch("/api/identify-ammo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
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

  // Reset upload area
  function resetUploadArea() {
    imagePreviewContainer.style.display = "none";
    analyzeBtn.disabled = true;
    fileInput.value = "";
    resultsSection.style.display = "none";

    validationChecking.style.display = "none";
    uploadSuccess.style.display = "none";
    validationError.style.display = "none";

    document.querySelector(".upload-icon").style.display = "block";
    document.querySelector(".upload-text").style.display = "block";
    document.querySelector(".upload-subtext").style.display = "block";
  }

  // Button handlers
  removeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    resetUploadArea();
  });

  reuploadBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    fileInput.click();
  });

  // Analysis button
  analyzeBtn.addEventListener("click", async function () {
    console.log("Starting analysis...");
    resultsSection.style.display = "block";
    loadingIndicator.style.display = "block";
    resultsContent.style.display = "none";

    try {
      const analysis = await identifyAmmunition(imagePreview.src);
      showResults(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      loadingIndicator.style.display = "none";
      alert("Analysis failed: " + error.message);
      resultsSection.style.display = "none";
    }
  });

  // Show results
  function showResults(analysis) {
    loadingIndicator.style.display = "none";
    resultsContent.style.display = "block";

    document.getElementById(
      "identificationTitle"
    ).textContent = `${analysis.caliber} Identified`;
    document.getElementById(
      "confidenceBar"
    ).style.width = `${analysis.confidence}%`;
    document.getElementById(
      "confidenceText"
    ).textContent = `Confidence: ${analysis.confidence}%`;
    document.getElementById("identificationDetails").textContent =
      analysis.description;
    document.getElementById("ballisticsData").textContent = analysis.ballistics;
    document.getElementById("safetyNotes").textContent = analysis.safety;
    document.getElementById("historicalInfo").textContent = analysis.history;
  }

  // Email capture
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
        headers: {
          "Content-Type": "application/json",
        },
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

  console.log("App initialized successfully!");
}
