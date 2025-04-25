// Function to calculate PO price (1/3 of estimate price)
function calculatePOPrice(price) {
    // Remove $ and convert to number
    const numericPrice = parseFloat(price.replace('$', ''));
    return numericPrice / 3;
}

// Function to display purchase order
function displayPurchaseOrder(estimate) {
    const poDisplay = document.getElementById('purchaseOrderDisplay');
    const poCustomer = document.getElementById('poCustomer');
    const poDate = document.getElementById('poDate');
    const poItems = document.getElementById('poItems');
    const poGrandTotal = document.getElementById('poGrandTotal');

    // Display customer info
    poCustomer.textContent = estimate.customer.name;
    poDate.textContent = estimate.date;

    // Clear existing items
    poItems.innerHTML = '';
    
    let grandTotal = 0;
    
    // Add items with adjusted prices
    estimate.items.forEach(item => {
        const lineTotal = calculatePOPrice(item.total);
        grandTotal += lineTotal;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.type}</td>
            <td>${item.selection}</td>
            <td>${item.quantity}</td>
            <td>$${lineTotal.toFixed(2)}</td>
        `;
        poItems.appendChild(row);
    });

    // Update grand total
    poGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
    poDisplay.style.display = 'block';
}

// Load and display estimates
function loadEstimates() {
    const estimatesList = document.getElementById('estimatesList');
    estimatesList.innerHTML = '';
    
    // Get estimates from localStorage
    const estimates = JSON.parse(localStorage.getItem('estimates') || '[]');
    
    estimates.forEach(estimate => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="clickable">${estimate.customer.name}</td>
            <td>${estimate.date}</td>
            <td>${estimate.totalAmount}</td>
        `;
        
        // Add click handler
        row.querySelector('.clickable').addEventListener('click', () => {
            displayPurchaseOrder(estimate);
        });
        
        estimatesList.appendChild(row);
    });
}


// Initialize page
document.addEventListener('DOMContentLoaded', loadEstimates);
