document.addEventListener('DOMContentLoaded', () => {
    // Debug: Check if estimates exist in localStorage
    console.log('Initial estimates:', localStorage.getItem('estimates'));
    
    // Load and display estimates
    loadEstimates();
});

function loadEstimates() {
    try {
        // Get and parse estimates from localStorage
        const estimatesJson = localStorage.getItem('estimates');
        console.log('Raw estimates from localStorage:', estimatesJson);
        
        const estimates = JSON.parse(estimatesJson) || [];
        console.log('Parsed estimates:', estimates);
        
        const tableBody = document.querySelector('.estimates-table tbody');
        
        if (!estimates.length) {
            tableBody.innerHTML = '<tr><td colspan="3">No estimates found</td></tr>';
            return;
        }

        // Create table rows
        const html = estimates.map(estimate => {
            // Ensure estimate has required properties
            if (!estimate || !estimate.customer) {
                console.log('Invalid estimate:', estimate);
                return '';
            }

            // Convert ID to string and ensure it exists
            const id = (estimate.id || Date.now()).toString();
            const name = estimate.customer.name || 'Unknown';
            const date = estimate.date || 'No date';

            return `
                <tr>
                    <td><a href="#" class="estimate-link" data-id="${id}">${name}</a></td>
                    <td>${date}</td>
                    <td><button class="delete-btn" data-id="${id}">Delete</button></td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = html;

        // Add click handlers for view links
        document.querySelectorAll('.estimate-link').forEach(link => {
            link.addEventListener('click', handleEstimateClick);
        });

        // Add click handlers for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteClick);
        });

    } catch (error) {
        console.error('Error in loadEstimates:', error);
        const tableBody = document.querySelector('.estimates-table tbody');
        tableBody.innerHTML = '<tr><td colspan="3">Error loading estimates</td></tr>';
    }
}

function handleEstimateClick(event) {
    event.preventDefault();
    
    try {
        // Get ID from clicked element
        const id = event.target.getAttribute('data-id');
        console.log('Clicked estimate ID:', id);
        
        if (!id) {
            throw new Error('No estimate ID found');
        }

        // Get estimates from localStorage
        const estimatesJson = localStorage.getItem('estimates');
        console.log('Looking for estimate in:', estimatesJson);
        
        const estimates = JSON.parse(estimatesJson) || [];
        
        // Find matching estimate
        const estimate = estimates.find(est => {
            const estId = (est.id || '').toString();
            const clickedId = id.toString();
            console.log('Comparing:', estId, 'with', clickedId);
            return estId === clickedId;
        });

        if (!estimate) {
            throw new Error(`Estimate with ID ${id} not found`);
        }

        // Navigate to details page
        window.location.href = `estimate-details.html?id=${id}`;

    } catch (error) {
        console.error('Error handling estimate click:', error);
        alert('Error viewing estimate details. Please try again.');
    }
}

function handleDeleteClick(event) {
    try {
        // Get ID from clicked delete button
        const id = event.target.getAttribute('data-id');
        console.log('Delete clicked for estimate ID:', id);
        
        if (!id) {
            throw new Error('No estimate ID found for deletion');
        }

        // Confirm deletion
        const confirmDelete = confirm('Are you sure you want to delete this estimate?');
        if (!confirmDelete) {
            return; // User cancelled deletion
        }

        // Get estimates from localStorage
        const estimatesJson = localStorage.getItem('estimates');
        const estimates = JSON.parse(estimatesJson) || [];
        
        // Filter out the estimate to delete
        const updatedEstimates = estimates.filter(est => {
            const estId = (est.id || '').toString();
            const deleteId = id.toString();
            return estId !== deleteId;
        });

        // Save updated estimates back to localStorage
        localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
        console.log('Estimate deleted. Updated estimates:', updatedEstimates);
        
        // Reload the estimates table
        loadEstimates();
        
        // Show success message
        alert('Estimate deleted successfully');

    } catch (error) {
        console.error('Error deleting estimate:', error);
        alert('Error deleting estimate. Please try again.');
    }
}

function debugEstimates() {
    try {
        const estimatesJson = localStorage.getItem('estimates');
        console.log('Raw localStorage data:', estimatesJson);
        
        const estimates = JSON.parse(estimatesJson) || [];
        console.log('Parsed estimates:', estimates);
        
        estimates.forEach((est, index) => {
            console.log(`Estimate ${index}:`, {
                id: est.id,
                idType: typeof est.id,
                customer: est.customer,
                date: est.date
            });
        });
    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Call this function when page loads
document.addEventListener('DOMContentLoaded', debugEstimates);