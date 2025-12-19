async function fetchBuildings() {
    try {
        const res = await fetch(`${API_URL}/admin/buildings`);
        window.allBuildings = await res.json();
        const tbody = document.getElementById('buildingTableBody');
        tbody.innerHTML='';
        window.allBuildings.forEach(b => {
            tbody.innerHTML += `<tr class="hover:bg-gray-50 border-b border-gray-50 transition-colors"><td class="px-6 py-4 font-medium text-gray-900">${b.name}</td><td class="px-6 py-4 text-gray-600">${b.type}</td><td class="px-6 py-4 text-gray-600">${b.total_floors}</td><td class="px-6 py-4 text-gray-600">${b.unit_count} Units</td><td class="px-6 py-4 flex gap-2"><button onclick="openBuildingModal(${b.id})" class="text-blue-600 hover:text-blue-800 font-medium border px-2 py-1 rounded">Edit</button><button onclick="viewUnits(${b.id})" class="text-gray-600 hover:text-gray-800 font-medium border px-2 py-1 rounded">Units</button><button onclick="deleteBuilding(${b.id})" class="text-red-600 hover:text-red-800 font-medium ml-2">Delete</button></td></tr>`;
        });
    } catch(e){}
}

function openBuildingModal(id=null) {
    document.getElementById('buildingModal').classList.remove('hidden');
    if(id) {
        const b = window.allBuildings.find(i=>i.id===id);
        document.getElementById('modalTitle').innerText="Edit Building";
        document.getElementById('buildingId').value=b.id;
        document.getElementById('bName').value=b.name;
        document.getElementById('bType').value=b.type;
        document.getElementById('bFloors').value=b.total_floors;
        document.getElementById('bFloors').disabled=true;
        document.getElementById('bUnits').disabled=true;
        toggleUnitInput();
    } else {
        document.getElementById('modalTitle').innerText="Add New Building";
        document.getElementById('buildingForm').reset();
        document.getElementById('buildingId').value='';
        document.getElementById('bFloors').disabled=false;
        document.getElementById('bUnits').disabled=false;
        toggleUnitInput();
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
    units.forEach(u => { tbody.innerHTML+=`<tr class="border-b last:border-0"><td class="py-3 text-gray-500">Floor ${u.floor_number}</td><td class="py-3"><input type="text" value="${u.unit_name}" id="unit-${u.id}" onblur="updateUnitName(${u.id})" class="border rounded px-2 py-1 w-full text-gray-800 focus:ring-ranconBlue"></td><td class="py-3 text-xs text-green-600">Auto-saved</td></tr>`; });
    document.getElementById('unitModal').classList.remove('hidden');
}

async function updateUnitName(id) { await fetch(`${API_URL}/admin/unit/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({unit_name: document.getElementById(`unit-${id}`).value}) }); }
async function deleteBuilding(id) { if(confirm("Delete?")) { await fetch(`${API_URL}/admin/buildings/${id}`, {method:'DELETE'}); fetchBuildings(); } }

document.getElementById('buildingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('buildingId').value;
    const data = { type: document.getElementById('bType').value, name: document.getElementById('bName').value, total_floors: document.getElementById('bFloors').value, units_per_floor: document.getElementById('bType').value === 'Residential' ? document.getElementById('bUnits').value : 1 };
    await fetch(id ? `${API_URL}/admin/buildings/${id}` : `${API_URL}/admin/buildings`, { method: id ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
    closeModal('buildingModal'); fetchBuildings();
});