async function fetchBuildings() {
    try {
        const res = await fetch(`${API_URL}/admin/buildings`);
        window.allBuildings = await res.json();
        const tbody = document.getElementById('buildingTableBody');
        tbody.innerHTML='';
        window.allBuildings.forEach(b => {
            // Unit count display
            const unitDisplay = b.unit_count > 0 ? `${b.unit_count} Units` : `<span class="text-red-400 text-xs">No Config</span>`;
            
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">${b.name}</td>
                    <td class="px-6 py-4 text-gray-600">${b.type}</td>
                    <td class="px-6 py-4 text-gray-600">${b.total_floors} Levels</td>
                    <td class="px-6 py-4 text-gray-600 font-medium">${unitDisplay}</td>
                    <td class="px-6 py-4 flex gap-2">
                        <button onclick="openBuildingModal(${b.id})" class="text-blue-600 hover:text-blue-800 font-medium border px-2 py-1 rounded">Edit</button>
                        <button onclick="viewUnits(${b.id})" class="text-gray-600 hover:text-gray-800 font-medium border px-2 py-1 rounded">Units</button>
                        <button onclick="deleteBuilding(${b.id})" class="text-red-600 hover:text-red-800 font-medium ml-2">Delete</button>
                    </td>
                </tr>`;
        });
    } catch(e){ console.error(e); }
}

function addRangeRow(start = '', end = '', units = '') {
    const container = document.getElementById('rangeContainer');
    const div = document.createElement('div');
    div.className = 'grid grid-cols-3 gap-2 items-center range-row animate-zoom-in';
    div.innerHTML = `
        <input type="number" placeholder="Start" value="${start}" class="range-start w-full px-3 py-2 border rounded focus:ring-1 focus:ring-ranconBlue text-sm">
        <input type="number" placeholder="End" value="${end}" class="range-end w-full px-3 py-2 border rounded focus:ring-1 focus:ring-ranconBlue text-sm">
        <div class="flex gap-1">
            <input type="number" placeholder="Units" value="${units}" class="range-units w-full px-3 py-2 border rounded focus:ring-1 focus:ring-ranconBlue text-sm">
            <button type="button" onclick="this.closest('.range-row').remove()" class="text-red-400 hover:text-red-600 px-1">&times;</button>
        </div>
    `;
    container.appendChild(div);
}




function openBuildingModal(id=null) {
    document.getElementById('buildingModal').classList.remove('hidden');
    const container = document.getElementById('rangeContainer');
    container.innerHTML = ''; // Clear previous rows

    if(id) {
        // Edit Mode
        const b = window.allBuildings.find(i=>i.id===id);
        document.getElementById('modalTitle').innerText="Edit Building Details";
        document.getElementById('buildingId').value=b.id;
        document.getElementById('bName').value=b.name;
        document.getElementById('bType').value=b.type;
        document.getElementById('bFloors').value=b.total_floors;
        
        // Hide config section for edit (Editing structure is complex, let's keep it simple: Create = Structure, Edit = Name/Type)
        document.getElementById('unitConfigSection').classList.add('hidden'); 
        document.getElementById('bFloors').disabled = true;
    } else {
        // Create Mode
        document.getElementById('modalTitle').innerText="Add New Building";
        document.getElementById('buildingForm').reset();
        document.getElementById('buildingId').value='';
        document.getElementById('bFloors').disabled = false;
        
        // Show Config
        document.getElementById('unitConfigSection').classList.remove('hidden');
        // Add one default row
        addRangeRow(1, '', 2); 
    }
}

function toggleUnitInput() {
    const type = document.getElementById('bType').value;
    const group = document.getElementById('unitInputGroup');
    if(type==='Commercial') { group.style.display='none'; document.getElementById('bUnits').value=1; } else { group.style.display='block'; }
}

async function viewUnits(id) {
    const res = await fetch(`${API_URL}/admin/building/${id}/units`);
    const units = await res.json();
    const tbody = document.getElementById('unitListBody');
    tbody.innerHTML='';
    units.forEach(u => { tbody.innerHTML+=`<tr class="border-b last:border-0"><td class="py-3 text-gray-500">Floor ${u.floor_number}</td><td class="py-3"><input type="text" value="${u.unit_name}" id="unit-${u.id}" onblur="updateUnitName(${u.id})" class="border rounded px-2 py-1 w-full text-gray-800 focus:ring-ranconBlue text-sm"></td><td class="py-3 text-xs text-green-600">Auto-saved</td></tr>`; });
    document.getElementById('unitModal').classList.remove('hidden');
}


async function updateUnitName(id) {
    await fetch(`${API_URL}/admin/unit/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({unit_name: document.getElementById(`unit-${id}`).value})
    });
}






async function deleteBuilding(id) { 
    if(confirm("Delete?")) { 
        await fetch(`${API_URL}/admin/buildings/${id}`, {method:'DELETE'}); 
        showToast("Building Deleted", "info"); 
        fetchBuildings(); 
    } 
}
document.getElementById('buildingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('buildingId').value;
    const name = document.getElementById('bName').value;
    const type = document.getElementById('bType').value;
    const totalFloors = document.getElementById('bFloors').value;

    if (id) {
        // UPDATE (Name/Type only)
        await fetch(`${API_URL}/admin/buildings/${id}`, { 
            method: 'PUT', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ name, type }) 
        });
        showToast("Building Updated", "success");
    } else {
        // CREATE (With Dynamic Ranges)
        const rows = document.querySelectorAll('.range-row');
        const ranges = [];
        
        rows.forEach(row => {
            const start = parseInt(row.querySelector('.range-start').value);
            const end = parseInt(row.querySelector('.range-end').value);
            const units = parseInt(row.querySelector('.range-units').value);
            if(start && end && units) {
                ranges.push({ start, end, units });
            }
        });

        if(ranges.length === 0) {
            showToast("Please define at least one floor range", "error");
            return;
        }

        const data = { name, type, total_floors: totalFloors, ranges };
        
        const res = await fetch(`${API_URL}/admin/buildings`, { 
            method: 'POST', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify(data) 
        });
        const result = await res.json();
        
        if(!res.ok) {
            showToast(result.error || "Failed to create", "error");
            return;
        }
        showToast("Building Structure Created!", "success");
    }
    
    closeModal('buildingModal'); 
    fetchBuildings();
});