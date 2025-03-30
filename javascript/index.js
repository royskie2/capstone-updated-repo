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

    // Close sidebar on window resize (if moving from mobile to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && sidebar.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            
            // Restore body scrolling
            document.body.style.overflow = '';
        }
    });

    // Highlight active menu item
    const currentLocation = window.location.href;
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(link => {
        if (currentLocation.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
});