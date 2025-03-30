document.addEventListener('DOMContentLoaded', function() {
    // Burger menu and sidebar toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (mobileMenuToggle && sidebar && overlay) {
      mobileMenuToggle.addEventListener('click', function() {
        mobileMenuToggle.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent body scrolling when sidebar is open
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
      });

      overlay.addEventListener('click', function() {
        mobileMenuToggle.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        
        // Restore body scrolling
        document.body.style.overflow = '';
      });

      // Close sidebar when clicking on a link (mobile)
      const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
      sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
          mobileMenuToggle.classList.remove('active');
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          
          // Restore body scrolling
          document.body.style.overflow = '';
        });
      });
    }
  });
  document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Check for admin credentials
        if (username.toLowerCase() === 'admin' && password.toLowerCase() === 'admin') {
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Default vendor login behavior (redirect to business setup)
            window.location.href = 'business_setup.html';
        }
    });

    // Mobile menu toggle functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
});