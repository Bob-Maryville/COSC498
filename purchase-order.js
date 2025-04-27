document.addEventListener('DOMContentLoaded', () => {
    console.log('Purchase Order page loaded');
    
    // Load and display estimates
    loadEstimates();
    
    // Set up event listeners for search and sort
    document.getElementById('customerSearch').addEventListener('input', filterEstimates);
    document.getElementById('sortOrder').addEventListener('change', sortEstimates);
    
    // Event listener for print button
    document.getElementById('printButton').addEventListener('click', () => {
        window.print();
    });
    
    // Event listener for save button
    document.getElementById('saveButton').addEventListener('click', savePurchaseOrder);
});

// Function to load and display all estimates
function loadEstimates() {
    try {
        // Get estimates from localStorage
        const estimatesJson = localStorage.getItem('estimates');
        console.log('Raw estimates from localStorage:', estimatesJson);
        
        const estimates = JSON.parse(estimatesJson) || [];
        console.log('Parsed estimates:', estimates);
        
        // Store estimates globally for filtering and sorting
        window.allEstimates = estimates;
        
        // Display estimates
        displayEstimates(estimates);
        
    } catch (error) {
        console.error('Error loading estimates:', error);
        showError('Error loading estimates. Please try again.');
    }
}

// Function to display estimates in the table
function displayEstimates(estimates) {
    const estimatesList = document.getElementById('estimatesList');
    
    // Clear existing content
    estimatesList.innerHTML = '';
    
    // Check if there are any estimates
    if (!estimates || estimates.length === 0) {
        estimatesList.innerHTML = '<tr><td colspan="3">No estimates found. Please create an estimate first.</td></tr>';
        return;
    }
    
    // Create table rows for each estimate
    estimates.forEach(estimate => {
        if (!estimate || !estimate.customer) {
            console.log('Invalid estimate:', estimate);
            return;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="clickable" data-id="${estimate.id}">${estimate.customer.name || 'Unknown'}</td>
            <td>${estimate.date || 'No date'}</td>
            <td>${estimate.totalAmount || '$0.00'}</td>
        `;
        
        // Add click handler
        row.querySelector('.clickable').addEventListener('click', handleEstimateClick);
        
        estimatesList.appendChild(row);
    });
}

// Function to handle estimate selection
function handleEstimateClick(event) {
    try {
        // Get the estimate ID
        const id = event.target.getAttribute('data-id');
        if (!id) throw new Error('No estimate ID found');
        
        console.log('Selected estimate ID:', id);
        
        // Find the estimate in the array
        const estimate = window.allEstimates.find(est => est.id.toString() === id.toString());
        if (!estimate) throw new Error(`Estimate with ID ${id} not found`);
        
        // Display the purchase order
        createPurchaseOrder(estimate);
        
    } catch (error) {
        console.error('Error selecting estimate:', error);
        showError('Error selecting estimate. Please try again.');
    }
}

// Function to filter estimates based on search input
function filterEstimates() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    
    // Filter estimates
    const filteredEstimates = window.allEstimates.filter(estimate => {
        if (!estimate || !estimate.customer || !estimate.customer.name) return false;
        return estimate.customer.name.toLowerCase().includes(searchTerm);
    });
    
    // Update the list with filtered estimates
    displayEstimates(filteredEstimates);
}

// Function to sort estimates
function sortEstimates() {
    const sortBy = document.getElementById('sortOrder').value;
    const estimates = [...window.allEstimates]; // Create a copy to avoid modifying the original
    
    // Sort the estimates
    estimates.sort((a, b) => {
        if (sortBy === 'name') {
            return (a.customer?.name || '').localeCompare(b.customer?.name || '');
        } else if (sortBy === 'date') {
            return new Date(a.date || 0) - new Date(b.date || 0);
        } else if (sortBy === 'total') {
            // Remove currency symbols and convert to number
            const aTotal = parseFloat((a.totalAmount || '0').replace(/[^0-9.-]+/g, ''));
            const bTotal = parseFloat((b.totalAmount || '0').replace(/[^0-9.-]+/g, ''));
            return aTotal - bTotal;
        }
        return 0;
    });
    
    // Update the list with sorted estimates
    displayEstimates(estimates);
}

// Function to display error messages
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Function to create and display a purchase order
function createPurchaseOrder(estimate) {
    try {
        // Generate PO number
        const poNumber = generatePONumber(estimate);
        
        // Calculate PO date (current date)
        const today = new Date();
        const formattedToday = formatDate(today);
        
        // Display PO information
        document.getElementById('poNumber').textContent = poNumber;
        document.getElementById('poDate').textContent = formattedToday;
        document.getElementById('poCustomer').textContent = estimate.customer.name || 'N/A';
        document.getElementById('poAddress').textContent = estimate.customer.address || 'N/A';
        document.getElementById('poEmail').textContent = estimate.customer.email || 'N/A';
        document.getElementById('poPhone').textContent = estimate.customer.phone || 'N/A';
        document.getElementById('generationDate').textContent = formattedToday;
        
        // Clear existing items
        const poItemsTable = document.getElementById('poItems');
        poItemsTable.innerHTML = '';
        
        // Process items and calculate totals
        let grandTotal = 0;
        
        // Check if estimate has items
        if (estimate.items && estimate.items.length > 0) {
            estimate.items.forEach(item => {
                // Calculate PO price (1/3 of estimate price)
                const originalPrice = parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
                const poPrice = originalPrice / 3;
                grandTotal += poPrice;
                
                // Create row for item
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatItemType(item.type || '')}</td>
                    <td>${formatSelectionName(item.selection || '')}</td>
                    <td>${item.quantity || '0'}</td>
                    <td>$${poPrice.toFixed(2)}</td>
                `;
                
                poItemsTable.appendChild(row);
            });
        } else {
            // No items found
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" style="text-align: center;">No items found</td>';
            poItemsTable.appendChild(row);
        }
        
        // Update grand total
        document.getElementById('poGrandTotal').textContent = `$${grandTotal.toFixed(2)}`;
        
        // Store purchase order data for saving
        window.currentPO = {
            id: poNumber,
            poDate: formattedToday,
            estimate: estimate.id,
            customer: estimate.customer,
            items: estimate.items,
            totalAmount: `$${grandTotal.toFixed(2)}`,
            createdAt: new Date().toISOString()
        };
        
        // Show the purchase order
        document.getElementById('purchaseOrderDisplay').style.display = 'block';
        
        // Scroll to the purchase order
        document.getElementById('purchaseOrderDisplay').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error creating purchase order:', error);
        showError('Error creating purchase order. Please try again.');
    }
}

// Function to generate a PO number
function generatePONumber(estimate) {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Extract first 3 letters of customer name and convert to uppercase
    const customerPrefix = estimate.customer.name.substring(0, 3).toUpperCase();
    
    // Random 3-digit number
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `PO-${year}${month}${day}-${customerPrefix}-${randomNum}`;
}

// Function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }).format(date);
}

// Function to format item type
function formatItemType(type) {
    // Convert kebab case to title case
    return type
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to format selection name
function formatSelectionName(selection) {
    // Convert kebab case to title case
    return selection
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to save purchase order
function savePurchaseOrder() {
    try {
        if (!window.currentPO) {
            throw new Error('No purchase order data available to save');
        }
        
        // Get existing purchase orders
        const savedPOs = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
        
        // Add new purchase order
        savedPOs.push(window.currentPO);
        
        // Save to localStorage
        localStorage.setItem('purchaseOrders', JSON.stringify(savedPOs));
        
        // Show success message
        alert('Purchase Order saved successfully!');
        
    } catch (error) {
        console.error('Error saving purchase order:', error);
        showError('Error saving purchase order. Please try again.');
    }
}