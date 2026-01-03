// Navigation
function switchView(viewName) {
    // Hide all
    ['view-tickets', 'view-staff', 'view-buildings', 'view-admins'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    // Reset Nav Styles
    const baseClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm";
    const inactive = `${baseClass} inactive-nav`;
    const active = `${baseClass} active-nav`;

    ['nav-tickets', 'nav-staff', 'nav-buildings', 'nav-admins'].forEach(id => {
        document.getElementById(id).className = inactive;
    });

    // Show Selected
    document.getElementById(`view-${viewName}`).classList.remove('hidden');
    document.getElementById(`nav-${viewName}`).className = active;

    // Set Title & Fetch Data
    const titles = { tickets: 'Support Overview', staff: 'Staff Management', buildings: 'Building Management', admins: 'Admin Management' };
    document.getElementById('pageTitle').innerText = titles[viewName];

    if (viewName === 'staff') fetchStaff();
    else if (viewName === 'buildings') fetchBuildings();
    else if (viewName === 'admins') fetchAdmins();
    else fetchTickets();
}

// Generic Modal Utils
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function toggleProfileMenu() { document.getElementById('profileMenu').classList.toggle('hidden'); }

// Image Viewer
function openImageViewer(url) {
    const viewer = document.getElementById('imageViewer');
    const img = document.getElementById('fullImage');
    img.src = url;
    viewer.classList.remove('hidden');
    setTimeout(() => {
        img.classList.remove('scale-95', 'opacity-0');
        img.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    const img = document.getElementById('fullImage');
    img.classList.remove('scale-100', 'opacity-100');
    img.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { viewer.classList.add('hidden'); }, 300);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    
    // Toggle classes
    if (sidebar.classList.contains('-translate-x-full')) {
        // Open
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
    } else {
        // Close
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
    }
}

const originalSwitchView = window.switchView || switchView;
window.switchView = function(viewName) {
    originalSwitchView(viewName); // Call original logic
    
    // If on mobile (screen width < 768px), close sidebar after click
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
};