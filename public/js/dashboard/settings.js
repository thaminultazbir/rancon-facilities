// js/dashboard/settings.js

// 1. Safe Toast Helper
function safeToast(message, type) {
    if (window.showToast) window.showToast(message, type);
    else alert(message);
}

// 2. Global UI Functions
window.openAdminModal = function() {
    document.getElementById('createAdminModal').classList.remove('hidden');
    document.getElementById('createAdminForm').reset();
    document.getElementById('projectSelectContainer').classList.add('hidden');
};

// --- NEW: EDIT LOGIC ---
window.openEditAdminModal = async function(adminId) {
    const admin = window.allAdmins.find(a => a.id === adminId);
    if (!admin) return;

    document.getElementById('editAdminId').value = admin.id;
    document.getElementById('editAdminName').value = admin.name;
    document.getElementById('editAdminEmail').value = admin.email;
    document.getElementById('editAdminPhone').value = admin.phone;
    document.getElementById('editAdminRole').value = admin.role;

    const container = document.getElementById('editProjectSelectContainer');
    const select = document.getElementById('editAdminBuilding');
    
    await populateBuildingSelect('editAdminBuilding'); 

    if (admin.role === 'Project Admin') {
        container.classList.remove('hidden');
        if (admin.assigned_bid) select.value = admin.assigned_bid; 
    } else {
        container.classList.add('hidden');
        select.value = "";
    }

    document.getElementById('editAdminModal').classList.remove('hidden');
};

window.toggleProjectSelect = function() {
    handleRoleToggle('newAdminRole', 'projectSelectContainer', 'newAdminBuilding');
};

window.toggleEditProjectSelect = function() {
    handleRoleToggle('editAdminRole', 'editProjectSelectContainer', 'editAdminBuilding');
};

function handleRoleToggle(roleId, containerId, selectId) {
    const role = document.getElementById(roleId).value;
    const container = document.getElementById(containerId);
    if (role === 'Project Admin') {
        container.classList.remove('hidden');
        populateBuildingSelect(selectId);
    } else {
        container.classList.add('hidden');
    }
}

window.openProfileModal = function() { 
    document.getElementById('profileMenu').classList.add('hidden'); 
    document.getElementById('profileModal').classList.remove('hidden'); 
    fetchProfile(); // Calls the updated function below
};

// 3. Populate Buildings Helper
async function populateBuildingSelect(elementId = 'newAdminBuilding') {
    const select = document.getElementById(elementId);
    if (select.options.length > 1) return; // Cached

    try {
        const res = await fetch(`${API_URL}/admin/buildings`);
        const buildings = await res.json();
        
        buildings.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.text = b.name;
            select.appendChild(opt);
        });
    } catch (e) { console.error(e); }
}

// ---------------------------------------------------------
//  NEW: PROFILE & PASSWORD LOGIC (UPDATED)
// ---------------------------------------------------------

// A. Fetch Profile (Reads ID from LocalStorage)
async function fetchProfile() {
    const adminData = localStorage.getItem('adminData');
    if (!adminData) return;
    
    const admin = JSON.parse(adminData);
    const id = admin.id; // <--- KEY FIX

    try {
        const res = await fetch(`${API_URL}/admin/profile?id=${id}`);
        const data = await res.json();

        // Update Header UI
        document.getElementById('headerAdminName').innerText = data.name;
        const avatarUrl = data.avatar ? `/${data.avatar}` : `https://ui-avatars.com/api/?name=${data.name}&background=076C99&color=fff`;
        document.getElementById('headerAvatar').src = avatarUrl;
        
        // Update Modal Inputs
        document.getElementById('modalProfileName').innerText = data.name;
        document.getElementById('modalAvatarPreview').src = avatarUrl;
        document.getElementById('pName').value = data.name;
        document.getElementById('pPhone').value = data.phone;
        document.getElementById('pEmail').value = data.email;
    } catch (e) { console.error("Profile fetch error", e); }
}
window.fetchProfile = fetchProfile; // Export to window

// B. Profile Image Preview
window.previewAvatar = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('modalAvatarPreview').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
};

// C. Update Profile Submit
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const adminData = JSON.parse(localStorage.getItem('adminData'));
    const formData = new FormData(e.target);
    formData.append('id', adminData.id); // Add ID to request

    try {
        const res = await fetch(`${API_URL}/admin/profile`, {
            method: 'POST',
            body: formData // Sending FormData for file upload
        });
        const result = await res.json();
        
        if (res.ok) {
            safeToast('Profile updated successfully', 'success');
            fetchProfile(); // Refresh UI
            // Update local storage name if changed
            adminData.name = formData.get('name');
            localStorage.setItem('adminData', JSON.stringify(adminData));
        } else {
            safeToast(result.error || 'Update failed', 'error');
        }
    } catch (error) {
        console.error(error);
        safeToast('Server error', 'error');
    }
});

// D. Change Password Submit
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const adminData = JSON.parse(localStorage.getItem('adminData'));
    const currentPassword = document.getElementById('currPass').value;
    const newPassword = document.getElementById('newPass').value;

    try {
        const res = await fetch(`${API_URL}/admin/password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: adminData.id, 
                currentPassword, 
                newPassword 
            })
        });
        const result = await res.json();

        if (result.error) {
            safeToast(result.error, 'error');
        } else {
            safeToast('Password changed successfully', 'success');
            document.getElementById('passwordForm').reset();
        }
    } catch (error) {
        safeToast('Server error', 'error');
    }
});

// ---------------------------------------------------------
//  ADMIN MANAGEMENT LOGIC
// ---------------------------------------------------------

// 4. Create Admin Submit
document.getElementById('createAdminForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    submitAdminForm(
        `${API_URL}/admin/create`, 
        'POST', 
        {
            name: document.getElementById('newAdminName').value, 
            email: document.getElementById('newAdminEmail').value, 
            phone: document.getElementById('newAdminPhone').value, 
            password: document.getElementById('newAdminPassword').value,
            role: document.getElementById('newAdminRole').value,
            assigned_building_id: document.getElementById('newAdminBuilding').value
        },
        'createAdminModal'
    );
});

// 5. Edit Admin Submit
document.getElementById('editAdminForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('editAdminId').value;
    submitAdminForm(
        `${API_URL}/admin/${id}`, 
        'PUT', 
        {
            name: document.getElementById('editAdminName').value, 
            email: document.getElementById('editAdminEmail').value, 
            phone: document.getElementById('editAdminPhone').value, 
            role: document.getElementById('editAdminRole').value,
            assigned_building_id: document.getElementById('editAdminBuilding').value
        },
        'editAdminModal'
    );
});

async function submitAdminForm(url, method, data, modalId) {
    if (data.role === 'Project Admin' && !data.assigned_building_id) {
        safeToast("Please assign a project", "error");
        return;
    }
    
    try {
        const res = await fetch(url, { 
            method: method, 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data) 
        });
        const result = await res.json();
        
        if(res.ok) { 
            safeToast("Success!", "success"); 
            closeModal(modalId); 
            fetchAdmins(); 
        } else { 
            safeToast(result.error || "Failed", "error"); 
        }
    } catch(err) { safeToast("Server Error", "error"); }
}

// 6. Fetch Admins List
async function fetchAdmins() {
    try {
        const res = await fetch(`${API_URL}/admin/list`);
        window.allAdmins = await res.json(); 
        
        const tbody = document.getElementById('adminTableBody');
        tbody.innerHTML = '';
        
        window.allAdmins.forEach(a => {
            const avatar = a.avatar ? `/${a.avatar}` : `https://ui-avatars.com/api/?name=${a.name}&background=076C99&color=fff`;
            
            const assignedText = a.building_name 
                ? `<span class="flex items-center gap-1 text-gray-600"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> ${a.building_name}</span>`
                : `<span class="text-gray-400 italic">Unassigned</span>`;

            const roleBadge = a.role === 'Super Admin' 
                ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Super Admin</span>' 
                : `<div class="flex flex-col items-start gap-1"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Project Admin</span><div class="text-[10px] ml-1">${assignedText}</div></div>`;

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap"><img src="${avatar}" class="w-10 h-10 rounded-full border border-gray-200 object-cover"></td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${a.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">${a.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">${a.phone}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${roleBadge}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">${new Date(a.created_at).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="openEditAdminModal(${a.id})" class="text-ranconBlue hover:text-[#065a82] font-medium text-sm flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Edit
                        </button>
                    </td>
                </tr>`;
        });
    } catch(e) { console.error("Fetch admins failed", e); }
}
window.fetchAdmins = fetchAdmins;