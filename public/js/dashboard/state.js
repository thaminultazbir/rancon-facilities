const API_URL = '/api';

// Auth Guard
const adminData = localStorage.getItem('adminData');
if (!adminData) {
    window.location.href = '/login.html';
}
const currentAdmin = JSON.parse(adminData);

// Global State Containers
window.allTickets = [];
window.allStaff = [];
window.allBuildings = [];
window.currentTicketId = null;

// Logout Function
function logout() {
    localStorage.removeItem('adminData');
    window.location.href = '/login.html';
}

// Helper to clean image paths (Removes 'public/' prefix if present)
function getImagePath(path) {
    if (!path) return 'https://ui-avatars.com/api/?name=Admin';
    // Remove 'public/' or 'public\' from the start of the string
    const cleanPath = path.replace(/^public[\\/]/, '').replace(/\\/g, '/');
    return `/${cleanPath}`;
}


async function fetchProfile() {
    try {
        const res = await fetch(`${API_URL}/admin/profile?id=${currentAdmin.id}`);
        const data = await res.json();
        
        // Update Sidebar/Header Admin Name
        const headerName = document.getElementById('headerAdminName');
        if(headerName) headerName.innerText = data.name;

        // Update Header Avatar with Cleaner Path
        const headerAvatar = document.getElementById('headerAvatar');
        if(headerAvatar) {
            headerAvatar.src = getImagePath(data.avatar);
        }

        // We also update the global currentAdmin object to keep it fresh
        window.currentAdminProfile = data;

    } catch (e) { console.error("Profile load failed", e); }
}