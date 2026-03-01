// --- ADMIN MANAGEMENT ---
async function fetchAdmins() {
    try {
        const res = await fetch(`${API_URL}/admin/list`);
        const admins = await res.json();
        const tbody = document.getElementById('adminTableBody');
        tbody.innerHTML = '';
        
        admins.forEach(a => {
            const avatar = a.avatar ? `/${a.avatar}` : `https://ui-avatars.com/api/?name=${a.name}&background=076C99&color=fff`;
            
            // Logic for Assigned Projects Display
            let projectDisplay = '';
            if (a.role === 'Super Admin') {
                projectDisplay = '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Global Access</span>';
            } else {
                projectDisplay = a.assigned_buildings 
                    ? `<span class="text-gray-700 font-medium text-sm">${a.assigned_buildings}</span>`
                    : '<span class="text-gray-400 italic text-xs">Unassigned</span>';
            }

            // Edit Button Logic (Only show for Project Admins or if you want to edit self)
            // Note: Preventing editing of other Super Admins if needed, but for now we allow all.
            const editBtn = `<button onclick="openEditAdmin(${a.id})" class="text-ranconBlue hover:bg-blue-50 p-2 rounded transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>`;

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td class="px-6 py-4"><img src="${avatar}" class="w-10 h-10 rounded-full border border-gray-200 object-cover"></td>
                    <td class="px-6 py-4 font-medium text-gray-900">${a.name}</td>
                    <td class="px-6 py-4 text-gray-600">${a.email}</td>
                    <td class="px-6 py-4">${projectDisplay}</td>
                    <td class="px-6 py-4 text-gray-600">${a.phone || '-'}</td>
                    <td class="px-6 py-4 text-right">${editBtn}</td>
                </tr>`;
        });
    } catch(e) { console.error("Failed to fetch admins", e); }
}


function openAdminModal() { document.getElementById('createAdminModal').classList.remove('hidden'); }

document.getElementById('createAdminForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const editId = document.getElementById('editAdminId').value;
    const checkboxes = document.querySelectorAll('input[name="assigned_buildings"]:checked');
    const buildingIds = Array.from(checkboxes).map(cb => cb.value);

    const payload = { 
        name: document.getElementById('newAdminName').value, 
        email: document.getElementById('newAdminEmail').value, 
        phone: document.getElementById('newAdminPhone').value, 
        building_ids: buildingIds
    };

    // Password logic
    const pass = document.getElementById('newAdminPassword').value;
    if (pass) payload.password = pass;

    let url, method;

    if (editId) {
        // --- UPDATE MODE ---
        url = `${API_URL}/admin/update`;
        method = 'PUT';
        payload.id = editId; // Add ID to payload
    } else {
        // --- CREATE MODE ---
        url = `${API_URL}/admin/create`;
        method = 'POST';
        payload.requesting_admin_id = currentAdmin.id;
        if (!payload.password) return alert("Password is required for new admins");
    }
    
    try {
        const res = await fetch(url, { 
            method: method, 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        const result = await res.json();
        
        if(res.ok) { 
            showToast(editId ? "Admin Updated!" : "Admin Created!", "success");
            closeModal('createAdminModal'); 
            fetchAdmins(); 
        } else { 
            showToast(result.error || "Operation failed", "error"); 
        }
    } catch(err) { alert("Server Error"); }
});


// --- PROFILE SETTINGS ---
function openProfileModal() { 
    document.getElementById('profileMenu').classList.add('hidden'); 
    document.getElementById('profileModal').classList.remove('hidden'); 
    fetchProfile(); 
}

// Helper to clean image paths (Removes 'public/' prefix)
function getCleanImage(path) {
    if (!path) return 'https://ui-avatars.com/api/?name=Admin';
    return '/' + path.replace(/^public[\\/]/, '').replace(/\\/g, '/');
}


async function fetchProfile() {
    try {
        const res = await fetch(`${API_URL}/admin/profile?id=${currentAdmin.id}`);
        const data = await res.json();
        
        // Update Sidebar/Header
        document.getElementById('headerAdminName').innerText = data.name;
        document.getElementById('headerAvatar').src = getCleanImage(data.avatar);
        
        // Update Modal Inputs
        document.getElementById('pName').value = data.name;
        document.getElementById('pEmail').value = data.email;
        document.getElementById('pPhone').value = data.phone;
        document.getElementById('modalProfileName').innerText = data.name;
        document.getElementById('modalAvatarPreview').src = getCleanImage(data.avatar);
    } catch (e) { console.error("Profile load failed", e); }
}


function previewAvatar(input) { 
    if (input.files && input.files[0]) { 
        const reader = new FileReader(); 
        reader.onload = function(e) { 
            document.getElementById('modalAvatarPreview').src = e.target.result; 
        }; 
        reader.readAsDataURL(input.files[0]); 
    } 
}



// Update Profile Details
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const fd = new FormData(); 
    fd.append('id', currentAdmin.id); 
    fd.append('name', document.getElementById('pName').value); 
    fd.append('email', document.getElementById('pEmail').value); 
    fd.append('phone', document.getElementById('pPhone').value); 
    
    if(document.getElementById('profileUpload').files[0]) {
        fd.append('avatar', document.getElementById('profileUpload').files[0]);
    }
    
    try {
        const res = await fetch(`${API_URL}/admin/profile`, { method: 'POST', body: fd }); 
        const r = await res.json(); 
        showToast("Profile Updated Successfully", "success"); // <--- NEW
        fetchProfile(); 
    } catch(err) { showToast("Failed to update profile", "error"); }
});


document.getElementById('passwordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const currPass = document.getElementById('currPass').value;
    const newPass = document.getElementById('newPass').value;

    if(!currPass || !newPass) {
        alert("Please fill in both password fields.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/admin/password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: currentAdmin.id, 
                currentPassword: currPass, 
                newPassword: newPass 
            })
        });

        const result = await res.json();
        
        if(res.ok) {
            showToast("Password updated successfully!", "success"); // <--- NEW
            document.getElementById('passwordForm').reset();
        } else {
            showToast(result.error || "Failed to update password", "error");
        }
    } catch(err) { alert("Server connection error"); }
});










async function populateBuildingCheckboxes() {
    const container = document.getElementById('buildingCheckboxContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/admin/buildings`);
        const buildings = await res.json();
        container.innerHTML = buildings.map(b => `
            <label class="flex items-center space-x-2 mb-1">
                <input type="checkbox" name="assigned_buildings" value="${b.id}" class="rounded text-ranconBlue">
                <span class="text-sm text-gray-700">${b.name}</span>
            </label>
        `).join('');
    } catch (e) { console.error(e); }
}


async function openEditAdmin(id) {
    // 1. Show Modal & Set ID
    document.getElementById('createAdminModal').classList.remove('hidden');
    document.getElementById('editAdminId').value = id;
    
    // 2. Update UI Text
    document.querySelector('#createAdminModal h3').innerText = "Edit Admin & Assignments";
    document.querySelector('#createAdminForm button[type="submit"]').innerText = "Update Admin";
    document.getElementById('newAdminPassword').placeholder = "Leave blank to keep current";
    document.getElementById('newAdminPassword').required = false;

    try {
        // Load checkboxes first so we can check them later
        await populateBuildingCheckboxes(); 
        
        // Fetch Admin Data
        const res = await fetch(`${API_URL}/admin/profile?id=${id}`);
        const data = await res.json();

        // ERROR CHECK: Stop if backend returned an error
        if (data.error) {
            alert("Error: " + data.error);
            closeModal('createAdminModal');
            return;
        }

        // 3. Fill Inputs (Safe assignment using || '')
        document.getElementById('newAdminName').value = data.name || '';
        document.getElementById('newAdminEmail').value = data.email || '';
        document.getElementById('newAdminPhone').value = data.phone || '';

        // 4. Check the boxes for assigned buildings
        // First, uncheck all boxes to be safe
        document.querySelectorAll('input[name="assigned_buildings"]').forEach(cb => cb.checked = false);

        // Then check the ones returned from DB
        if (data.building_ids && Array.isArray(data.building_ids)) {
            data.building_ids.forEach(bId => {
                const checkbox = document.querySelector(`input[name="assigned_buildings"][value="${bId}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

    } catch(e) { 
        console.error("Error loading admin details", e);
        alert("Failed to load admin data. Check console for details.");
    }
}


const originalCloseModal = window.closeModal;
window.closeModal = function(id) {
    originalCloseModal(id);
    if(id === 'createAdminModal') {
        document.getElementById('createAdminForm').reset();
        document.getElementById('editAdminId').value = ''; // Clear ID
        document.querySelector('#createAdminModal h3').innerText = "Create New Admin";
        document.querySelector('#createAdminForm button[type="submit"]').innerText = "Create Admin";
        document.getElementById('newAdminPassword').required = true;
    }
};

const originalOpenAdminModal = window.openAdminModal;
window.openAdminModal = function() {
    originalOpenAdminModal();
    populateBuildingCheckboxes();
};