// --- ADMIN MANAGEMENT ---
async function fetchAdmins() {
    try {
        const res = await fetch(`${API_URL}/admin/list`);
        const admins = await res.json();
        const tbody = document.getElementById('adminTableBody');
        tbody.innerHTML = '';
        admins.forEach(a => {
            const avatar = a.avatar ? `/${a.avatar}` : `https://ui-avatars.com/api/?name=${a.name}&background=076C99&color=fff`;
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td class="px-6 py-4"><img src="${avatar}" class="w-10 h-10 rounded-full border border-gray-200 object-cover"></td>
                    <td class="px-6 py-4 font-medium text-gray-900">${a.name}</td>
                    <td class="px-6 py-4 text-gray-600">${a.email}</td>
                    <td class="px-6 py-4 text-gray-600">${a.phone}</td>
                    <td class="px-6 py-4 text-gray-400 text-xs">${new Date(a.created_at).toLocaleDateString()}</td>
                </tr>`;
        });
    } catch(e) { console.error("Failed to fetch admins", e); }
}


function openAdminModal() { document.getElementById('createAdminModal').classList.remove('hidden'); }

document.getElementById('createAdminForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = { 
        name: document.getElementById('newAdminName').value, 
        email: document.getElementById('newAdminEmail').value, 
        phone: document.getElementById('newAdminPhone').value, 
        password: document.getElementById('newAdminPassword').value 
    };
    
    try {
        const res = await fetch(`${API_URL}/admin/create`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(data) 
        });
        const result = await res.json();
        
        if(res.ok) { 
            alert("Admin Created Successfully!"); 
            closeModal('createAdminModal'); 
            document.getElementById('createAdminForm').reset(); 
            fetchAdmins(); 
        } else { 
            alert(result.error || "Failed to create admin"); 
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
        alert(r.message); 
        fetchProfile(); 
    } catch(err) { alert("Failed to update profile"); }
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
            alert("Password updated successfully!");
            document.getElementById('passwordForm').reset();
        } else {
            alert(result.error || "Failed to update password");
        }
    } catch(err) { alert("Server connection error"); }
});