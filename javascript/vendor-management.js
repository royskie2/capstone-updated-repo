document.addEventListener('DOMContentLoaded', function() {
    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
    new Chart(userGrowthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [120, 190, 300, 450, 620, 850],
                borderColor: 'rgb(255, 107, 53)',
                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // User Demographics Chart
    const userDemographicsCtx = document.getElementById('userDemographicsChart').getContext('2d');
    new Chart(userDemographicsCtx, {
        type: 'pie',
        data: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
            datasets: [{
                label: 'User Age Distribution',
                data: [25, 35, 20, 12, 8],
                backgroundColor: [
                    'rgba(255, 107, 53, 0.8)',
                    'rgba(46, 125, 50, 0.8)',
                    'rgba(69, 39, 160, 0.8)',
                    'rgba(255, 160, 0, 0.8)',
                    'rgba(84, 110, 122, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});
// DOM Elements
const addVendorBtn = document.getElementById('addVendorBtn');
const addVendorModal = document.getElementById('addVendorModal');
const closeVendorModal = document.getElementById('closeVendorModal');
const cancelAddVendor = document.getElementById('cancelAddVendor');
const addVendorForm = document.getElementById('addVendorForm');

// Show the modal when "Add Vendor" button is clicked
addVendorBtn.addEventListener('click', () => {
  addVendorModal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
});

// Close the modal when "X" is clicked
closeVendorModal.addEventListener('click', () => {
  addVendorModal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Re-enable scrolling
});

// Close the modal when "Cancel" button is clicked
cancelAddVendor.addEventListener('click', () => {
  addVendorModal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Close the modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === addVendorModal) {
    addVendorModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// Handle form submission
addVendorForm.addEventListener('submit', (event) => {
  event.preventDefault();
  
  // Get form values
  const vendorName = document.getElementById('vendorName').value;
  const vendorCategory = document.getElementById('vendorCategory').value;
  const vendorLocation = document.getElementById('vendorLocation').value;
  const vendorStatus = document.getElementById('vendorStatus').value;
  
  // Create new vendor row in the table
  const vendorTable = document.querySelector('.vendor-table tbody');
  const newRow = document.createElement('tr');
  
  // Set badge class based on status
  let badgeClass = 'badge-success';
  if (vendorStatus === 'pending') {
    badgeClass = 'badge-warning';
  } else if (vendorStatus === 'suspended') {
    badgeClass = 'badge-danger';
  }
  
  // Format status text for display
  const statusText = vendorStatus.charAt(0).toUpperCase() + vendorStatus.slice(1);
  
  // Add vendor data to the new row
  newRow.innerHTML = `
    <td>${vendorName}</td>
    <td>${vendorCategory}</td>
    <td>${vendorLocation}</td>
    <td><span class="badge ${badgeClass}">${statusText}</span></td>
    <td>
      <button class="btn btn-light btn-sm">View</button>
      <button class="btn btn-light btn-sm">Edit</button>
    </td>
  `;
  
  // Add the new row to the table
  vendorTable.appendChild(newRow);
  
  // Update total vendors count
  const totalVendorsElement = document.querySelector('.stat-card:first-child .stat-value');
  let totalVendors = parseInt(totalVendorsElement.textContent);
  totalVendorsElement.textContent = totalVendors + 1;
  
  // Update corresponding status counters
  if (vendorStatus === 'active') {
    const activeVendorsElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    let activeVendors = parseInt(activeVendorsElement.textContent);
    activeVendorsElement.textContent = activeVendors + 1;
  } else if (vendorStatus === 'pending') {
    const pendingVendorsElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    let pendingVendors = parseInt(pendingVendorsElement.textContent);
    pendingVendorsElement.textContent = pendingVendors + 1;
  } else if (vendorStatus === 'suspended') {
    const suspendedVendorsElement = document.querySelector('.stat-card:nth-child(4) .stat-value');
    let suspendedVendors = parseInt(suspendedVendorsElement.textContent);
    suspendedVendorsElement.textContent = suspendedVendors + 1;
  }
  
  // Show success notification
  showNotification(`${vendorName} has been added successfully!`, 'success');
  
  // Reset form and close modal
  addVendorForm.reset();
  addVendorModal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Notification function
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  // Add notification to the page
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    hideNotification(notification);
  }, 5000);
  
  // Close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    hideNotification(notification);
  });
}

// Hide notification function
function hideNotification(notification) {
  notification.classList.remove('show');
  setTimeout(() => {
    notification.remove();
  }, 300);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translateY(-20px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1100;
    min-width: 300px;
    max-width: 400px;
  }
  
  .notification.show {
    transform: translateY(0);
    opacity: 1;
  }
  
  .notification.success {
    border-left: 4px solid #4CAF50;
  }
  
  .notification.error {
    border-left: 4px solid #F44336;
  }
  
  .notification.info {
    border-left: 4px solid #2196F3;
  }
  
  .notification-content {
    flex: 1;
  }
  
  .notification-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #777;
    margin-left: 10px;
  }
`;

document.head.appendChild(style);