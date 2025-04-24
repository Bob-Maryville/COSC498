document.addEventListener('DOMContentLoaded', () => {
    // Debug: Log initial state
    console.log('Page loaded, checking for estimate ID...');
    
    const id = getEstimateId();
    if (!id) {
        displayError('No estimate ID provided');
        return;
    }

    const estimate = getEstimate(id);
    if (!estimate) {
        displayError(`Estimate with ID ${id} not found`);
        return;
    }

    displayEstimate(estimate);
});

function getEstimateId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getEstimate(id) {
    try {
        const estimatesJson = localStorage.getItem('estimates');
        console.log('Raw estimates from localStorage:', estimatesJson);
        
        if (!estimatesJson) {
            console.log('No estimates found in localStorage');
            return null;
        }

        const estimates = JSON.parse(estimatesJson);
        console.log('Parsed estimates:', estimates);
        
        const estimate = estimates.find(est => est.id.toString() === id.toString());
        console.log('Found estimate:', estimate);
        
        return estimate;
    } catch (error) {
        console.error('Error getting estimate:', error);
        return null;
    }
}

function displayEstimate(estimate) {
    const container = document.getElementById('estimate-details');
    if (!container) {
        console.error('Estimate details container not found');
        return;
    }

    try {
        // Ensure estimate has required properties
        if (!estimate || !estimate.customer) {
            throw new Error('Invalid estimate data');
        }

        // Ensure items array exists
        const items = estimate.items || [];
        console.log('Items to display:', items);

        const html = `
            <div class="estimate-details">
                <h2>Estimate Details</h2>
                
                <div class="customer-info">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${estimate.customer.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${estimate.customer.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${estimate.customer.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> ${estimate.customer.address || 'N/A'}</p>
                    <p><strong>Date:</strong> ${estimate.date || 'N/A'}</p>
                </div>

                <div class="items-section">
                    <h3>Items</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Selection</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.length > 0 ? items.map(item => `
                                <tr>
                                    <td>${item.type || 'N/A'}</td>
                                    <td>${item.selection || 'N/A'}</td>
                                    <td>${item.quantity || '0'}</td>
                                    <td>${item.price || '$0.00'}</td>
                                    <td>${item.total || '$0.00'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">No items found</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div class="total-section">
                    <h3>Total Amount: ${estimate.totalAmount || '$0.00'}</h3>
                </div>

                <div class="actions">
                    <a href="find-estimate.html" class="button">Back to Estimates</a>
                </div>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.error('Error displaying estimate:', error);
        displayError('Error displaying estimate details');
    }
}

function displayError(message) {
    const container = document.getElementById('estimate-details');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="find-estimate.html" class="button">Return to Estimates List</a>
            </div>
        `;
    }
}
