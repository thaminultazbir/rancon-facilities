/**
 * public/js/dashboard/buildings.js
 * FIXED VERSION: Unit Management & Ranges
 */

// 1. Fetch Buildings List
async function fetchBuildings() {
    try {
        // Use relative path to avoid API_URL errors
        const res = await fetch('/api/admin/buildings');
        
        if (!res.ok) throw new Error("Failed to load buildings");

        const buildings = await res.json();
        const tbody = document.getElementById('buildingTableBody');
        tbody.innerHTML = '';

        if (buildings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">No buildings found.</td></tr>`;
            return;
        }

        buildings.forEach(b => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">${b.name}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded text-xs font-bold ${b.type === 'Residential' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}">
                            ${b.type}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-600">${b.total_floors} Floors</td>
                    <td class="px-6 py-4 text-gray-600">${b.total_units || 0} Units</td>
                    <td class="px-6 py-4 flex gap-2">
                        <button onclick="openUnitManager(${b.id}, '${b.name}')" class="text-ranconBlue hover:bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg transition-colors text-xs font-bold shadow-sm">
                            Units
                        </button>
                        <button onclick="deleteBuilding(${b.id})" class="text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent px-2 py-1 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>`;
        });
    } catch (e) { 
        console.error("Fetch Error:", e);
        document.getElementById('buildingTableBody').innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data. Check console.</td></tr>`;
    }
}

// ---------------------------------------------------------
// UNIT MANAGEMENT LOGIC (THE FIX)
// ---------------------------------------------------------

async function openUnitManager(buildingId, buildingName) {
    const subtitle = document.getElementById('unitModalSubtitle');
    if(subtitle) subtitle.innerText = `Editing units for: ${buildingName}`;
    
    const tbody = document.getElementById('unitListBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-8 text-gray-400 animate-pulse">Loading units data...</td></tr>';
    
    const modal = document.getElementById('unitModal');
    if(modal) modal.classList.remove('hidden');

    try {
        const res = await fetch(`/api/admin/building/${buildingId}/units`);
        if (!res.ok) throw new Error("Failed to load");
        const units = await res.json();
        
        tbody.innerHTML = '';
        if(units.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-8 text-gray-400">No units found.</td></tr>';
            return;
        }

        units.forEach(u => {
            // --- SMART FLOOR LABELING ---
            let floorLabel = '';
            const f = parseInt(u.floor_no); // Ensure it's a number

            if (f < 0) {
                floorLabel = `<span class="text-purple-600 font-bold">Basement ${Math.abs(f)}</span>`;
            } else if (f === 0) {
                floorLabel = `<span class="text-orange-600 font-bold">Ground Floor</span>`;
            } else {
                floorLabel = `Level ${f}`;
            }
            // -----------------------------
            
            tbody.innerHTML += `
                <tr class="group hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                    <td class="px-6 py-3 text-sm text-gray-600">${floorLabel}</td>
                    <td class="px-6 py-3">
                        <input 
                            type="text" 
                            value="${u.unit_name}" 
                            onblur="saveUnitName(this, ${u.id})" 
                            onfocus="this.select()"
                            class="w-full bg-transparent border border-transparent hover:border-gray-300 focus:bg-white focus:border-ranconBlue focus:ring-2 focus:ring-blue-100 rounded px-2 py-1 outline-none transition-all font-bold text-gray-700"
                        >
                    </td>
                    <td class="px-6 py-3 text-center w-24">
                        <span id="status-${u.id}" class="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Saved</span>
                    </td>
                </tr>
            `;
        });

    } catch(e) { 
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-red-500">Error: ${e.message}</td></tr>`;
    }
}








// AUTO SAVE FUNCTION
async function saveUnitName(input, unitId) {
    const newName = input.value.trim();
    const statusSpan = document.getElementById(`status-${unitId}`);
    
    if(!newName) return; 

    // Visual Feedback: Saving...
    statusSpan.innerText = "Saving...";
    statusSpan.className = "text-[10px] text-blue-500 font-bold opacity-100";

    try {
        const res = await fetch(`/api/admin/unit/${unitId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });

        if(res.ok) {
            statusSpan.innerText = "Saved";
            statusSpan.className = "text-[10px] text-green-500 font-bold opacity-100";
            setTimeout(() => { statusSpan.classList.add('opacity-0'); }, 2000);
        } else {
            throw new Error("Update failed");
        }
    } catch(e) {
        statusSpan.innerText = "Failed";
        statusSpan.className = "text-[10px] text-red-500 font-bold opacity-100";
    }
}

// ---------------------------------------------------------
// BUILDING CREATION LOGIC (Ranges)
// ---------------------------------------------------------

function addRangeRow() {
    const container = document.getElementById('rangeContainer');
    const rowId = Date.now(); 
    const div = document.createElement('div');
    div.className = "grid grid-cols-3 gap-2 items-center range-row animate-zoom-in";
    div.id = `row-${rowId}`;
    div.innerHTML = `
        <input type="number" placeholder="Start" class="range-from w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-ranconBlue text-sm" required>
        <input type="number" placeholder="End" class="range-to w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-ranconBlue text-sm" required>
        <div class="flex gap-1">
            <input type="number" placeholder="Units" class="range-count w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-ranconBlue text-sm" required>
            <button type="button" onclick="removeRangeRow('${rowId}')" class="text-red-400 hover:text-red-600 p-1">&times;</button>
        </div>`;
    container.appendChild(div);
}

function removeRangeRow(id) {
    const row = document.getElementById(`row-${id}`);
    if(row) row.remove();
}

document.getElementById('buildingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('bName').value;
    const type = document.getElementById('bType').value;
    const floors = parseInt(document.getElementById('bFloors').value);
    const ranges = [];
    
    document.querySelectorAll('.range-row').forEach(row => {
        const from = parseInt(row.querySelector('.range-from').value);
        const to = parseInt(row.querySelector('.range-to').value);
        const count = parseInt(row.querySelector('.range-count').value);

        // FIX: Check if it is a valid number, specifically allowing 0
        if (!isNaN(from) && !isNaN(to) && count > 0) {
            ranges.push({ from, to, count });
        }
    });

    if (ranges.length === 0) { alert("Please add at least one floor range configuration."); return; }
    const maxFloor = Math.max(...ranges.map(r => r.to));
    if (maxFloor > floors) { alert(`Error: Ranges exceed total floors (${floors}).`); return; }

    try {
        const res = await fetch('/api/admin/buildings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, floors, ranges })
        });
        if (res.ok) {
            // Use Toast if available, else alert
            if(window.showToast) showToast('Building created successfully!', 'success');
            else alert('Building created successfully!');
            
            closeModal('buildingModal');
            document.getElementById('buildingForm').reset();
            document.getElementById('rangeContainer').innerHTML = ''; 
            fetchBuildings();
        } else {
            const data = await res.json();
            alert(data.error || 'Creation failed');
        }
    } catch (e) { console.error(e); alert('Server Error'); }
});

function openBuildingModal() {
    document.getElementById('buildingModal').classList.remove('hidden');
    if(document.getElementById('rangeContainer').children.length === 0) addRangeRow();
}



async function deleteBuilding(id) {
    if(!confirm("Are you sure? This will delete the building AND all its units.")) return;
    
    try {
        const res = await fetch(`/api/admin/building/${id}`, { method: 'DELETE' });
        
        // Read response body regardless of success/failure
        const data = await res.json().catch(() => ({})); 

        if (res.ok) {
            if(window.showToast) showToast('Building deleted successfully', 'success');
            else alert('Building deleted successfully');
            fetchBuildings(); // Refresh the table
        } else {
            // Show the actual error from the server
            console.error("Server Error:", data);
            alert(`Delete Failed: ${data.error || "Unknown Server Error"}`);
        }
    } catch(e) { 
        console.error("Network/Code Error:", e); 
        alert("Request Failed: Check console for details."); 
    }
}








// Global Exports (Crucial for HTML Buttons)
window.fetchBuildings = fetchBuildings;
window.openBuildingModal = openBuildingModal;
window.addRangeRow = addRangeRow;
window.removeRangeRow = removeRangeRow;
window.openUnitManager = openUnitManager;
window.saveUnitName = saveUnitName;
window.deleteBuilding = deleteBuilding;