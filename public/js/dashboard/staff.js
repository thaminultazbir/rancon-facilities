async function fetchStaff() {
    try {
        const res = await fetch(`${API_URL}/admin/staff`);
        window.allStaff = await res.json();
        const tbody = document.getElementById('staffTableBody');
        if(!tbody) return; // Guard for partial loads
        tbody.innerHTML = '';
        window.allStaff.forEach(s => {
            const statusClass = s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
            tbody.innerHTML += `<tr class="hover:bg-gray-50 border-b border-gray-50 transition-colors"><td class="px-6 py-4 font-medium text-gray-900">${s.emp_id || '-'}</td><td class="px-6 py-4 font-medium text-gray-900">${s.name}</td><td class="px-6 py-4 text-gray-600">${s.role}</td><td class="px-6 py-4 text-gray-600">${s.contact}</td><td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs font-bold ${statusClass}">${s.status}</span></td><td class="px-6 py-4 flex gap-2"><button onclick="openStaffModal(${s.id})" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button><button onclick="deleteStaff(${s.id})" class="text-red-600 hover:text-red-800 font-medium ml-2">Delete</button></td></tr>`;
        });
    } catch(e){}
}

function openStaffModal(id=null) {
    document.getElementById('staffModal').classList.remove('hidden');
    if(id) {
        const s = window.allStaff.find(i=>i.id===id);
        document.getElementById('staffModalTitle').innerText="Edit Staff";
        document.getElementById('staffId').value=s.id;
        document.getElementById('staffEmpId').value=s.emp_id;
        document.getElementById('staffName').value=s.name;
        document.getElementById('staffRole').value=s.role;
        document.getElementById('staffContact').value=s.contact;
        document.getElementById('staffStatus').value=s.status;
    } else {
        document.getElementById('staffModalTitle').innerText="Add Staff";
        document.getElementById('staffForm').reset();
        document.getElementById('staffId').value='';
    }
}

async function deleteStaff(id) { 
    if(confirm("Delete staff?")) { 
        await fetch(`${API_URL}/admin/staff/${id}`, {method:'DELETE'}); 
        showToast("Staff Member Deleted", "info"); // <--- NEW
        fetchStaff(); 
    } 
}

async function populateStaffDropdown(selectedStaffId) {
    const select = document.getElementById('modalAssignStaff');
    select.innerHTML = '<option value="">Unassigned</option>';
    try {
        if (window.allStaff.length === 0) {
            const res = await fetch(`${API_URL}/admin/staff`);
            window.allStaff = await res.json();
        }
        window.allStaff.forEach(s => {
            if(s.status === 'Active') {
                const option = document.createElement('option');
                option.value = s.id;
                option.text = `${s.name} (${s.role})`;
                if (s.id == selectedStaffId) option.selected = true;
                select.appendChild(option);
            }
        });
    } catch (e) {}
}

// Init Form Listener
document.getElementById('staffForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('staffId').value;
    const data = { emp_id: document.getElementById('staffEmpId').value, name: document.getElementById('staffName').value, role: document.getElementById('staffRole').value, contact: document.getElementById('staffContact').value, status: document.getElementById('staffStatus').value };
    await fetch(id ? `${API_URL}/admin/staff/${id}` : `${API_URL}/admin/staff`, { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    closeModal('staffModal'); fetchStaff();
});