document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu functionality
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  mobileMenuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  });

  overlay.addEventListener("click", function () {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });

  // Multi-step form functionality
  const steps = document.querySelectorAll(".form-step");
  const stepIndicators = document.querySelectorAll(
    ".multi-step-indicator .step"
  );
  let currentStep = 0;

  // Next button handlers
  document.getElementById("step1Next").addEventListener("click", function () {
    // Validate step 1 fields
    const fullName = document.getElementById("fullName").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    goToStep(1);
  });

  document.getElementById("step2Next").addEventListener("click", function () {
    // Validate step 2 fields
    const businessName = document.getElementById("businessName").value;
    const businessType = document.getElementById("businessType").value;

    if (!businessName || !businessType) {
      alert("Please fill in all required fields.");
      return;
    }

    goToStep(2);
  });

  // Previous button handlers
  document.getElementById("step2Prev").addEventListener("click", function () {
    goToStep(0);
  });

  document.getElementById("step3Prev").addEventListener("click", function () {
    goToStep(1);
  });

  // File upload handlers
  document
    .getElementById("profilePicture")
    .addEventListener("change", function (e) {
      handleFileSelection("profilePictureSelected", e);
    });

  document.getElementById("idUpload").addEventListener("change", function (e) {
    handleFileSelection("idUploadSelected", e);
  });

  document
    .getElementById("selfieWithId")
    .addEventListener("change", function (e) {
      handleFileSelection("selfieWithIdSelected", e);
    });

  // Handle form submission
  document
    .getElementById("signupForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate step 3 fields
      const idUpload = document.getElementById("idUpload").value;
      const selfieWithId = document.getElementById("selfieWithId").value;
      const termsAgreement = document.getElementById("termsAgreement").checked;

      if (!idUpload || !selfieWithId || !termsAgreement) {
        alert("Please complete all required fields and agree to the terms.");
        return;
      }

      // Show success step and update indicators
      goToStep(3);

      // In a real application, you would submit the form data to the server here
      // For now, we're just showing the success step
    });

  // Helper functions
  function goToStep(stepIndex) {
    steps[currentStep].classList.remove("active");
    steps[stepIndex].classList.add("active");

    // Update step indicators
    stepIndicators[currentStep].classList.remove("active");
    stepIndicators[stepIndex].classList.add("active");

    // Mark previous steps as complete
    for (let i = 0; i < stepIndex; i++) {
      stepIndicators[i].classList.add("complete");
    }

    currentStep = stepIndex;

    // Scroll to top of form
    document
      .querySelector(".auth-container")
      .scrollIntoView({ behavior: "smooth" });
  }

  function handleFileSelection(elementId, event) {
    const fileNameElement = document.getElementById(elementId);
    if (event.target.files.length > 0) {
      fileNameElement.textContent = `Selected: ${event.target.files[0].name}`;
    } else {
      fileNameElement.textContent = "";
    }
  }
});
