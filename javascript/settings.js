document.addEventListener("DOMContentLoaded", () => {
  // Toggle switch interactivity (optional)
  const toggleSwitches = document.querySelectorAll(".toggle-switch input");
  // Sidebar toggle functionality
  document
    .getElementById("mobileMenuToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });

  toggleSwitches.forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      // Here you could add API calls or local storage updates
      console.log(
        `${e.target.id} is now ${e.target.checked ? "enabled" : "disabled"}`
      );
    });
  });

  // Placeholder for future functionality
  const editProfileBtn = document.querySelector(
    ".settings-section .btn-primary"
  );
  const changePasswordBtn = document.querySelector(
    ".settings-section .btn-secondary"
  );
  const managePlanBtn = document.querySelector(
    '.btn-primary[data-action="manage-plan"]'
  );

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      alert("Edit Profile functionality will be implemented soon.");
    });
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      alert("Change Password functionality will be implemented soon.");
    });
  }
});
