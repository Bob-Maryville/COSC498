// Price constants for all item types
const ITEM_PRICES = {
    'shingle-type': {
        '3-tab': 200.00,
        'architectural': 300.00,
        'designer': 400.00
    },
    'drip-edge': {
        'drip-edge-small': 5.00,
        'drip-edge-large': 8.00
    },
    'vent-type': {
        'box': 45.00,
        'turbine': 65.00,
        'ridge': 85.00
    },
    'chimney-flashing-size': {
        'chimney-small': 150.00,
        'chimney-medium': 200.00,
        'chimney-large': 250.00
    },
    'underlayment-type': {
        'felt': 50.00,
        'synthetic': 65.00
    },
    'dumpster-size': {
        'dump-small': 350.00,
        'dump-medium': 450.00,
        'dump-large': 550.00
    }
};

// Form validation rules with regex patterns
const validators = {
    name: (value) => ({
        isValid: /^[A-Za-z\s]{2,50}$/.test(value),
        message: 'Name must be 2-50 characters, letters only'
    }),
    email: (value) => ({
        isValid: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
        message: 'Please enter a valid email address'
    }),
    phone: (value) => ({
        isValid: /^\+?[1-9][0-9]{9,14}$/.test(value),
        message: 'Please enter a valid phone number (10-15 digits)'
    }),
    address: (value) => ({
        isValid: value.length >= 5 && value.length <= 100,
        message: 'Address must be between 5 and 100 characters'
    })
};

// Populate quantity dropdowns (1-100)
function populateQuantityDropdowns() {
    const quantitySelects = document.querySelectorAll('select[name$="quantity"]');
    quantitySelects.forEach(select => {
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        // Add options 1-100
        for (let i = 1; i <= 100; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            select.appendChild(option);
        }
    });
}

// Calculate and update line total for a row
function updateLineTotal(row) {
    const typeSelect = row.querySelector('td:first-child select');
    const quantitySelect = row.querySelector('td:nth-child(2) select');
    const priceCell = row.querySelector('.price-cell');
    const totalCell = row.querySelector('.total-cell');
    
    // Clear cells if no selection
    if (!typeSelect?.value || !quantitySelect?.value) {
        if (priceCell) priceCell.textContent = '';
        if (totalCell) totalCell.textContent = '';
        return 0;
    }
    
    // Calculate line total
    const itemType = typeSelect.name;
    const selectedValue = typeSelect.value;
    const quantity = parseInt(quantitySelect.value) || 0;
    
    const unitPrice = ITEM_PRICES[itemType]?.[selectedValue] || 0;
    const total = unitPrice * quantity;
    
    // Update cells with formatted currency
    priceCell.textContent = formatCurrency(unitPrice);
    totalCell.textContent = formatCurrency(total);
    
    return total;
}

// Update grand total
function updateGrandTotal() {
    const rows = document.querySelectorAll('.estimate-table tbody tr');
    let grandTotal = 0;
    
    // Sum all line totals
    rows.forEach(row => {
        const lineTotal = updateLineTotal(row);
        grandTotal += lineTotal;
    });
    
    // Create or update grand total row
    let grandTotalRow = document.querySelector('.grand-total-row');
    if (!grandTotalRow) {
        const table = document.querySelector('.estimate-table');
        grandTotalRow = document.createElement('tr');
        grandTotalRow.className = 'grand-total-row';
        grandTotalRow.innerHTML = `
            <td colspan="3" style="text-align: right"><strong>Grand Total:</strong></td>
            <td id="grandTotal"></td>
        `;
        table.appendChild(grandTotalRow);
    }
    
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
}

// Format currency with $ and 2 decimal places
function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
}

// Validate form before saving
function validateForm() {
    let isValid = true;
    const form = document.getElementById('customerForm');
    
    // Reset previous validation errors
    form.querySelectorAll('input').forEach(input => {
        input.setCustomValidity('');
    });
    
    // Validate all required input fields
    const requiredFields = ['name', 'email', 'phone', 'address'];
    for (const fieldName of requiredFields) {
        const input = document.getElementById(fieldName);
        if (!input) continue;
        
        // First check if field is empty
        if (!input.value.trim()) {
            isValid = false;
            input.setCustomValidity(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
            input.reportValidity();
            return false; // Stop on first error
        }
        
        // Then apply specific validation
        const validator = validators[fieldName];
        if (validator) {
            const result = validator(input.value);
            if (!result.isValid) {
                isValid = false;
                input.setCustomValidity(result.message);
                input.reportValidity();
                return false; // Stop on first error
            }
        }
    }

    // Validate date
    const dateInput = document.getElementById('date');
    if (!dateInput.value) {
        isValid = false;
        dateInput.setCustomValidity('Please select a date');
        dateInput.reportValidity();
        return false;
    }

    // Validate at least one item is selected
    const hasItems = Array.from(document.querySelectorAll('.estimate-table tbody tr'))
        .some(row => row.querySelector('td:first-child select')?.value);
    
    if (!hasItems) {
        isValid = false;
        alert('Please select at least one item for the estimate');
        return false;
    }

    return isValid;
}

function saveEstimate() {
    try {
        // First validate the form
        if (!validateForm()) {
            return; // Stop if validation fails
        }
        
        // Generate ID
        const estimateId = Date.now();
        
        // Collect estimate data
        const estimateData = {
            id: estimateId,
            date: document.getElementById('date').value,
            customer: {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value
            },
            items: [],
            totalAmount: document.getElementById('grandTotal').textContent
        };

        // Collect line items
        document.querySelectorAll('.estimate-table tbody tr').forEach(row => {
            const typeSelect = row.querySelector('td:first-child select');
            const quantitySelect = row.querySelector('td:nth-child(2) select');
            if (typeSelect?.value) {
                estimateData.items.push({
                    type: typeSelect.name,
                    selection: typeSelect.value,
                    quantity: parseInt(quantitySelect.value) || 0,
                    price: row.querySelector('.price-cell').textContent,
                    total: row.querySelector('.total-cell').textContent
                });
            }
        });

        // Get existing estimates
        let estimates = JSON.parse(localStorage.getItem('estimates')) || [];
        
        // Add new estimate
        estimates.push(estimateData);
        
        // Save to localStorage
        localStorage.setItem('estimates', JSON.stringify(estimates));

        // Success message and redirect
        showFeedback('Estimate saved successfully!', true);
        setTimeout(() => {
            window.location.href = 'find-estimate.html';
        }, 1500);
        
    } catch (error) {
        console.error('Save error:', error);
        showFeedback('Error saving estimate: ' + error.message, false);
    }
}

// Show feedback message
function showFeedback(message, isSuccess) {
    // Create feedback element if it doesn't exist
    let feedback = document.getElementById('saveFeedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'saveFeedback';
        feedback.style.padding = '10px';
        feedback.style.margin = '10px 0';
        feedback.style.borderRadius = '5px';
        feedback.style.textAlign = 'center';
        
        const saveButton = document.querySelector('.save-button');
        if (saveButton) {
            saveButton.after(feedback);
        } else {
            document.querySelector('.estimate-table').after(feedback);
        }
    }
    
    feedback.style.display = 'block';
    feedback.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
    feedback.style.color = isSuccess ? '#155724' : '#721c24';
    feedback.textContent = message;
    
    if (isSuccess) {
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 3000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Populate quantity dropdowns
    populateQuantityDropdowns();
    
    // Add event listeners for price updates
    document.querySelectorAll('.estimate-table select').forEach(select => {
        select.addEventListener('change', () => {
            updateGrandTotal();
        });
    });
    
    // Set up save button
    const saveButton = document.querySelector('.save-button');
    if (!saveButton) {
        const newSaveButton = document.createElement('button');
        newSaveButton.textContent = 'Save Estimate';
        newSaveButton.className = 'save-button';
        document.querySelector('.estimate-table').after(newSaveButton);
        
        // Add event listener to the save button
        newSaveButton.addEventListener('click', saveEstimate);
    } else {
        // Clean up any existing listeners and set a new one
        saveButton.removeEventListener('click', saveEstimate);
        saveButton.addEventListener('click', saveEstimate);
    }
    
    // Set today's date as default
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Calculate initial totals
    updateGrandTotal();
});