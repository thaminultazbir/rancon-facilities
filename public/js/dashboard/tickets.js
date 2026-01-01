async function fetchStats() {
    if (!window.currentAdmin || !window.currentAdmin.id) return;

    try {
        // SECURE CALL: Pass admin_id here too
        const res = await fetch(`${API_URL}/admin/stats?admin_id=${window.currentAdmin.id}`);
        const stats = await res.json();
        
        document.getElementById('totalCount').innerText = stats.total;
        document.getElementById('pendingCount').innerText = stats.pending;
        document.getElementById('resolvedCount').innerText = stats.resolved;
    } catch(e) { console.error(e); }
}


async function fetchTickets() {
    // Wait for currentAdmin to be loaded (from state.js/fetchProfile)
    if (!window.currentAdmin || !window.currentAdmin.id) {
        console.warn("Admin ID not loaded yet, retrying...");
        setTimeout(fetchTickets, 500); // Retry after 500ms
        return;
    }

    try {
        // SECURE CALL: Pass admin_id to backend
        const res = await fetch(`${API_URL}/admin/tickets?admin_id=${window.currentAdmin.id}`);
        if (!res.ok) throw new Error("Failed to load tickets");
        
        window.allTickets = await res.json();
        
        const tbody = document.getElementById('ticketTableBody');
        tbody.innerHTML = '';

        if (window.allTickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-400">No tickets found for your assigned project.</td></tr>';
            return;
        }

        window.allTickets.forEach(t => {
            // ... (Your existing row rendering logic goes here) ...
            // Copy the HTML generation from your previous version
             const statusColors = {
                'Pending': 'bg-yellow-100 text-yellow-800',
                'In Progress': 'bg-blue-100 text-blue-800',
                'Resolved': 'bg-green-100 text-green-800'
            };
            
            const staffDisplay = t.assigned_to 
                ? `<span class="flex items-center gap-1 font-medium text-gray-700"><div class="w-5 h-5 rounded-full bg-gray-200 text-[10px] flex items-center justify-center">${t.staff_name.charAt(0)}</div>${t.staff_name}</span>`
                : `<span class="text-gray-400 italic text-xs">Unassigned</span>`;

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-50 transition-colors cursor-pointer group" onclick="openTicketModal(${t.id})">
                    <td class="px-6 py-4 font-medium text-gray-900 group-hover:text-ranconBlue">#${t.id}</td>
                    <td class="px-6 py-4">
                        <div><p class="font-medium text-gray-900 text-sm">${t.name}</p><p class="text-xs text-gray-500">${t.contact}</p></div>
                    </td>
                    <td class="px-6 py-4 text-gray-600 text-sm">${t.building_name} <span class="text-gray-400">/ ${t.apartment}</span></td>
                    <td class="px-6 py-4 text-gray-600 text-sm truncate max-w-[150px]">${t.category}</td>
                    <td class="px-6 py-4">${staffDisplay}</td>
                    <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[t.status]}">${t.status}</span></td>
                    <td class="px-6 py-4 text-gray-400 hover:text-ranconBlue"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></td>
                </tr>`;
        });
        
        fetchStats(); // Update stats after tickets load

    } catch (e) { 
        console.error("Fetch Tickets Error:", e); 
    }
}




// ... inside public/js/dashboard/tickets.js

async function openTicketModal(id) {
    const ticket = window.allTickets.find(t => t.id === id);
    if (!ticket) return;
    window.currentTicketId = ticket.id;
    
    // UI Updates
    document.getElementById('modalCategoryBadge').innerText = ticket.category;
    document.getElementById('modalBuilding').innerText = ticket.building_name;
    document.getElementById('modalFloor').innerText = ticket.floor ? `Level ${ticket.floor}` : 'N/A'; 
    document.getElementById('modalApartment').innerText = ticket.apartment;
    document.getElementById('modalDetails').innerText = ticket.details;
    document.getElementById('modalName').innerText = ticket.name;
    document.getElementById('modalContact').innerText = ticket.contact;
    document.getElementById('avatarInitial').innerText = ticket.name.charAt(0).toUpperCase();

    // Status Buttons Logic
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.className = "px-3 py-1.5 rounded-lg border border-transparent text-gray-500 transition-all status-btn hover:bg-gray-50";
        if(btn.dataset.status === ticket.status) btn.classList.add('bg-gray-100', 'text-gray-900', 'font-bold', 'shadow-sm');
    });

    // --- FIXED IMAGE RENDERING BLOCK ---
    const imgContainer = document.getElementById('modalImages');
    imgContainer.innerHTML = '';
    
    if(ticket.images) {
        ticket.images.split(',').forEach(img => {
            // FIX: 
            // 1. .replace(/\\/g, '/')  -> Fixes Windows backslashes
            // 2. .replace(/^public\//, '') -> Removes 'public/' from the start
            const cleanPath = img.replace(/\\/g, '/').replace(/^public\//, '');
            const url = `/${cleanPath}`;

            imgContainer.innerHTML += `
                <div class="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all" onclick="openImageViewer('${url}')">
                    <img src="${url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </div>
                </div>`;
        });
    } else { 
        imgContainer.innerHTML = `<span class="text-xs text-gray-400 italic">No attachments</span>`; 
    }
    // -----------------------------------

    await populateStaffDropdown(ticket.assigned_to);
    fetchTicketUpdates(ticket.id);
    document.getElementById('ticketModal').classList.remove('hidden');
} 

// Activity Log Logic
async function fetchTicketUpdates(ticketId) {
    const container = document.getElementById('activityLogContainer');
    container.innerHTML = '<div class="text-center py-4"><div class="w-6 h-6 border-2 border-gray-300 border-t-ranconBlue rounded-full animate-spin mx-auto"></div></div>';
    try {
        const res = await fetch(`${API_URL}/admin/ticket/${ticketId}/updates`);
        const updates = await res.json();
        container.innerHTML = '';
        if (updates.length === 0) {
            container.innerHTML = `<div class="text-center py-10 opacity-50"><p class="text-xs text-gray-500">No updates yet.</p></div>`;
            return;
        }
        updates.forEach(u => {
            const date = new Date(u.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
            container.innerHTML += `<div class="mb-4 last:mb-0"><div class="flex justify-between items-end mb-1"><span class="text-[10px] font-bold text-ranconBlue bg-blue-100 px-2 py-0.5 rounded-full">ADMIN</span><span class="text-[10px] text-gray-400">${date}</span></div><div class="bg-white p-3 rounded-lg rounded-tl-none border border-gray-200 shadow-sm text-sm text-gray-700 leading-snug">${u.note}</div></div>`;
        });
    } catch (e) {}
}

async function addTicketNote() {
    const input = document.getElementById('newNoteInput');
    const note = input.value.trim();
    if(!note || !window.currentTicketId) return;
    input.value = '';
    await fetch(`${API_URL}/admin/ticket/${window.currentTicketId}/updates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note }) });
    fetchTicketUpdates(window.currentTicketId);
}

// Actions
async function updateStatus(status) {
    await fetch(`${API_URL}/admin/ticket/${window.currentTicketId}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    closeModal('ticketModal'); fetchTickets();
}

async function assignStaff() {
    const staffId = document.getElementById('modalAssignStaff').value;
    await fetch(`${API_URL}/admin/ticket/${window.currentTicketId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ staff_id: staffId }) });
    // alert("Assignment Updated!"); closeModal('ticketModal'); fetchTickets();
    showToast("Staff Assigned Successfully", "success");
    closeModal('ticketModal'); fetchTickets();
}