// public/js/toast.js

// 1. Create Container on Load
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
});

// 2. Main Toast Function
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    // Config based on type
    const config = {
        success: {
            bg: 'bg-white',
            border: 'border-l-4 border-green-500',
            text: 'text-gray-800',
            icon: `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        },
        error: {
            bg: 'bg-white',
            border: 'border-l-4 border-red-500',
            text: 'text-gray-800',
            icon: `<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        },
        info: {
            bg: 'bg-white',
            border: 'border-l-4 border-blue-500',
            text: 'text-gray-800',
            icon: `<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        }
    };

    const style = config[type] || config.success;

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = `${style.bg} ${style.border} shadow-lg rounded-r-lg p-4 flex items-center gap-3 min-w-[300px] transform translate-x-full transition-all duration-300 ease-out pointer-events-auto`;
    
    toast.innerHTML = `
        <div class="shrink-0">${style.icon}</div>
        <div class="text-sm font-medium ${style.text}">${message}</div>
    `;

    // Append
    container.appendChild(toast);

    // Animate In (Small delay to allow DOM render)
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300); // Wait for transition to finish
    }, 3000);
};