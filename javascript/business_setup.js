// Mobile menu toggle
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const sidebar = document.getElementById("sidebar");
const mobileBackdrop = document.getElementById("mobileBackdrop");

mobileMenuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  mobileBackdrop.classList.toggle("active");
  document.body.classList.toggle("menu-open");
});

mobileBackdrop.addEventListener("click", () => {
  sidebar.classList.remove("active");
  mobileBackdrop.classList.remove("active");
  document.body.classList.remove("menu-open");
});

// Initialize progress bar
const progressBar = document.querySelector(".progress-bar");
progressBar.style.width = "25%";

// Sample code for initializing charts when data becomes available
function initSalesChart() {
  const ctx = document.getElementById("salesChart");
  if (ctx) {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "Day 1",
          "Day 2",
          "Day 3",
          "Day 4",
          "Day 5",
          "Day 6",
          "Day 7",
        ],
        datasets: [
          {
            label: "Daily Sales (₱)",
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: "#4361ee",
            backgroundColor: "rgba(67, 97, 238, 0.1)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  }
}

// Call function when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // This will be enabled once the user has sales data
  // initSalesChart();
});