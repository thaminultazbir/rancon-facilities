// public/js/dashboard/buildings.js

// 1. Safe Toast Wrapper (Prevents crash if toast.js is missing)
function safeToast(message, type) {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        alert(message); // Fallback to standard alert
    }
}

// 2. Wrap everything in DOMContentLoaded to ensure HTML exists
document.addEventListener('DOMContentLoaded', () => {
    
    // Initial Load
    fetchBuildings();

    // Attach Submit Listener Safely
    const form = document.getElementById('buildingForm');
    if (form) {
        form.addEventListener('submit', handleBuildingSubmit);
    } else {
        console.error("Critical Error: 'buildingForm' not found in HTML.");
    }
});

// --- CORE FUNCTIONS ---

async function fetchBuildings() {
    try {
        const res = await fetch(`${API_URL}/admin/buildings`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        window.allBuildings = await res.json();
        const tbody = document.getElementById('buildingTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        window.allBuildings.forEach(b => {
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
    } catch(e) { console.error("Fetch Error:", e); }
}

// --- FORM HANDLING ---

async function handleBuildingSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('buildingId').value;
    const name = document.getElementById('bName').value;
    const type = document.getElementById('bType').value;
    const totalFloors = document.getElementById('bFloors').value;

    try {
        if (id) {
            // UPDATE (Name/Type only)
            const res = await fetch(`${API_URL}/admin/buildings/${id}`, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json'}, 
                body: JSON.stringify({ name, type }) 
            });
            
            if (res.ok) safeToast("Building Updated", "success");
            else throw new Error("Update failed");

        } else {
            // CREATE (With Dynamic Ranges)
            const rows = document.querySelectorAll('.range-row');
            const ranges = [];
            
            rows.forEach(row => {
                const startInput = row.querySelector('.range-start').value;
                const endInput = row.querySelector('.range-end').value;
                const unitsInput = row.querySelector('.range-units').value;
                
                // Ensure inputs are not empty
                if(startInput !== '' && endInput !== '' && unitsInput !== '') {
                    ranges.push({ 
                        start: parseInt(startInput), 
                        end: parseInt(endInput), 
                        units: parseInt(unitsInput) 
                    });
                }
            });

            if(ranges.length === 0) {
                safeToast("Please define at least one floor range", "error");
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
                throw new Error(result.error || "Failed to create");
            }
            safeToast("Building Structure Created!", "success");
        }
        
        closeModal('buildingModal'); 
        fetchBuildings();

    } catch (error) {
        console.error(error);
        safeToast(error.message, "error");
    }
}

// --- DYNAMIC UI LOGIC ---

// Made global so onclick HTML attributes can find them
window.addRangeRow = function(start = '', end = '', units = '') {
    const container = document.getElementById('rangeContainer');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'grid grid-cols-3 gap-2 items-center range-row animate-zoom-in';
    div.innerHTML = `
        <input type="number" placeholder="Start" value="${start}" class="range-start w-full px-3 py-2 border rounded focus:ring-1 focus:ring-ranconBlue text-sm">
        <input type="number" placeholder="End" value="${end}" class="range-end w-full px-3 py-2 border rounded focus:ring-1 focus:ring-ranconBlue text-sm">
        <div class="flex gap-1">
            <input type="number" placeholder="Units" value="${units}" class="range-units w-full px-3 py-2 border rounded focus:ring-1 focus:ring-ranconBlue text-sm">
            <button type="button" onclick="this.closest('.range-row').remove()" class="text-red-400 hover:text-red-600 px-1 font-bold text-lg">&times;</button>
        </div>
    `;
    container.appendChild(div);
};

window.openBuildingModal = function(id=null) {
    const modal = document.getElementById('buildingModal');
    const container = document.getElementById('rangeContainer');
    if (!modal || !container) return;

    modal.classList.remove('hidden');
    container.innerHTML = ''; // Clear rows

    if(id) {
        // Edit Mode
        const b = window.allBuildings.find(i=>i.id===id);
        if(!b) return;
        
        document.getElementById('modalTitle').innerText="Edit Building Details";
        document.getElementById('buildingId').value=b.id;
        document.getElementById('bName').value=b.name;
        document.getElementById('bType').value=b.type;
        document.getElementById('bFloors').value=b.total_floors;
        
        document.getElementById('unitConfigSection').classList.add('hidden'); 
        document.getElementById('bFloors').disabled = true;
    } else {
        // Create Mode
        document.getElementById('modalTitle').innerText="Add New Building";
        document.getElementById('buildingForm').reset();
        document.getElementById('buildingId').value='';
        document.getElementById('bFloors').disabled = false;
        
        document.getElementById('unitConfigSection').classList.remove('hidden');
        window.addRangeRow(1, '', 2); 
    }
};

window.deleteBuilding = async function(id) { 
    if(confirm("Are you sure you want to delete this building?")) { 
        await fetch(`${API_URL}/admin/buildings/${id}`, {method:'DELETE'}); 
        safeToast("Building Deleted", "info"); 
        fetchBuildings(); 
    } 
};

window.viewUnits = async function(id) {
    const res = await fetch(`${API_URL}/admin/building/${id}/units`);
    const units = await res.json();
    const tbody = document.getElementById('unitListBody');
    const modal = document.getElementById('unitModal');
    
    if(!tbody || !modal) return;
    
    tbody.innerHTML='';
    units.forEach(u => { 
        tbody.innerHTML+=`
        <tr class="border-b last:border-0">
            <td class="py-3 text-gray-500">Floor ${u.floor_number}</td>
            <td class="py-3">
                <input type="text" value="${u.unit_name}" id="unit-${u.id}" onblur="updateUnitName(${u.id})" class="border rounded px-2 py-1 w-full text-gray-800 focus:ring-ranconBlue text-sm">
            </td>
            <td class="py-3 text-xs text-green-600">Auto-saved</td>
        </tr>`; 
    });
    modal.classList.remove('hidden');
};

window.updateUnitName = async function(id) { 
    const input = document.getElementById(`unit-${id}`);
    if(input) {
        await fetch(`${API_URL}/admin/unit/${id}`, { 
            method: 'PUT', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({unit_name: input.value}) 
        }); 
    }
};