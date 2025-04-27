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
    
    // Add print functionality
    document.getElementById('print-button')?.addEventListener('click', () => {
        window.print();
    });
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

function formatItemType(type) {
    // Convert kebab case to title case
    return type
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatSelectionName(selection) {
    // Convert kebab case to title case
    return selection
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).format(date);
    } catch (e) {
        return dateString;
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
        
        // Format the date
        const formattedDate = formatDate(estimate.date);
        
        // Get today's date for "generated on" text
        const today = new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).format(new Date());

        const html = `
            <div class="estimate-container">
                <div class="estimate-header">
                    <div class="company-info">
                        <h1>Roofing Estimate</h1>
                        <h2>Bob's Roofing Company</h2>
                        <p>123 Main Street, St. Louis, MO 63101</p>
                        <p>Phone: (314) 123-4567</p>
                        <p>Email: info@bobsroofingcompany.com</p>
                    </div>
                    <div class="estimate-meta">
                        <div class="estimate-number">
                            <h3>Estimate #</h3>
                            <p>${estimate.id}</p>
                        </div>
                        <div class="estimate-date">
                            <h3>Date</h3>
                            <p>${formattedDate}</p>
                        </div>
                    </div>
                </div>

                <div class="customer-section">
                    <h2>Customer Information</h2>
                    <div class="customer-details">
                        <p><strong>Name:</strong> ${estimate.customer.name || 'N/A'}</p>
                        <p><strong>Address:</strong> ${estimate.customer.address || 'N/A'}</p>
                        <p><strong>Email:</strong> ${estimate.customer.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${estimate.customer.phone || 'N/A'}</p>
                    </div>
                </div>

                <div class="items-section">
                    <h2>Project Details</h2>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.length > 0 ? items.map(item => `
                                <tr>
                                    <td>${formatItemType(item.type || '')}</td>
                                    <td>${formatSelectionName(item.selection || '')}</td>
                                    <td class="text-center">${item.quantity || '0'}</td>
                                    <td class="text-right">${item.price || '$0.00'}</td>
                                    <td class="text-right">${item.total || '$0.00'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="5" class="text-center">No items found</td></tr>'}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="total-label">Total Amount:</td>
                                <td class="grand-total">${estimate.totalAmount || '$0.00'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="terms-section">
                    <h2>Terms & Conditions</h2>
                    <p>1. This estimate is valid for 30 days from the date of issue.</p>
                    <p>2. A 50% deposit is required to schedule work.</p>
                    <p>3. Final payment is due upon completion of work.</p>
                    <p>4. Warranty: 5-year workmanship warranty on all installations.</p>
                </div>
                
                <div class="signature-section">
                    <div class="signature-line">
                        <div class="line"></div>
                        <p>Customer Signature</p>
                    </div>
                    <div class="signature-line">
                        <div class="line"></div>
                        <p>Date</p>
                    </div>
                </div>
                
                <div class="estimate-footer">
                    <p>Generated on ${today}</p>
                </div>
                
                <div class="actions">
                    <button id="print-button" class="button primary-button">Print Estimate</button>
                    <a href="find-estimate.html" class="button secondary-button">Back to Estimates</a>
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
                <a href="find-estimate.html" class="button secondary-button">Return to Estimates List</a>
            </div>
        `;
    }
}