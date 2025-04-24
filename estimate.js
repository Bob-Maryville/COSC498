// Price constants for all item types
const ITEM_PRICES = {
    'shingle-type': {
        '3-tab': 75.00,
        'architectural': 95.00,
        'designer': 125.00
    },
    'drip-edge': {
        'drip-edge-small': 45.00,
        'drip-edge-large': 65.00
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
        'felt': 35.00,
        'synthetic': 55.00
    },
    'dumpster-size': {
        'dump-small': 350.00,
        'dump-medium': 450.00,
        'dump-large': 550.00
    }
};

// Form validation rules
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
        isValid: /^\+?[1-9][0-9]{9,9}$/.test(value),
        message: 'Please enter a valid phone number'
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
        while (select.options.length > 1) {
            select.remove(1);
        }
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
    
    if (!typeSelect?.value || !quantitySelect?.value) {
        if (priceCell) priceCell.textContent = '';
        if (totalCell) totalCell.textContent = '';
        return 0;
    }
    
    const itemType = typeSelect.name;
    const selectedValue = typeSelect.value;
    const quantity = parseInt(quantitySelect.value) || 0;
    
    const unitPrice = ITEM_PRICES[itemType]?.[selectedValue] || 0;
    const total = unitPrice * quantity;
    
    priceCell.textContent = formatCurrency(unitPrice);
    totalCell.textContent = formatCurrency(total);
    
    return total;
}

// Update grand total
function updateGrandTotal() {
    const rows = document.querySelectorAll('.estimate-table tbody tr');
    let grandTotal = 0;
    
    rows.forEach(row => {
        const lineTotal = updateLineTotal(row);
        grandTotal += lineTotal;
    });
    
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

// Collect all estimate data
function collectEstimateData() {
    const items = [];
    document.querySelectorAll('.estimate-table tbody tr').forEach(row => {
        const typeSelect = row.querySelector('td:first-child select');
        const quantitySelect = row.querySelector('td:nth-child(2) select');
        if (typeSelect?.value) {
            items.push({
                type: typeSelect.name,
                selection: typeSelect.value,
                quantity: parseInt(quantitySelect.value) || 0,
                price: row.querySelector('.price-cell').textContent,
                total: row.querySelector('.total-cell').textContent
            });
        }
    });

    return {
        id: Date.now(),
        date: document.getElementById('date').value,
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        },
        items: items,
        grandTotal: document.getElementById('grandTotal').textContent
    };
}

function saveEstimate() {
    console.log('Save operation starting...');
    
    try {
        // 1. Collect form data
        const estimateData = {
            customer: {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                date: document.getElementById('date').value
            },
            items: [],
            totalAmount: document.getElementById('grandTotal')?.textContent || '$0.00'
        };

        console.log('Customer data collected:', estimateData.customer);

        // 2. Collect line items
        document.querySelectorAll('.estimate-table tbody tr').forEach(row => {
            const typeSelect = row.querySelector('td:first-child select');
            const quantitySelect = row.querySelector('td:nth-child(2) select');
            
            if (typeSelect?.value) {
                const item = {
                    type: typeSelect.name,
                    selection: typeSelect.value,
                    quantity: parseInt(quantitySelect.value) || 0,
                    price: row.querySelector('.price-cell')?.textContent || '$0.00',
                    total: row.querySelector('.total-cell')?.textContent || '$0.00'
                };
                estimateData.items.push(item);
                console.log('Added line item:', item);
            }
        });

        // 3. Get existing estimates or create new array
        let estimates = [];
        const existingData = localStorage.getItem('estimates');
        
        if (existingData) {
            console.log('Found existing estimates:', existingData);
            estimates = JSON.parse(existingData);
        }

        // 4. Add new estimate
        estimates.push(estimateData);
        
        // 5. Save to localStorage
        localStorage.setItem('estimates', JSON.stringify(estimates));
        
        // 6. Verify save
        const savedData = localStorage.getItem('estimates');
        console.log('Verification - saved data:', savedData);
        
        // 7. Show success message
        alert('Estimate saved successfully!');
        console.log('Save completed successfully');
        
        return true;

    } catch (error) {
        console.error('Save failed:', error);
        alert('Failed to save estimate: ' + error.message);
        return false;
    }
}



// Validate form before saving
function validateForm() {
    let isValid = true;
    const form = document.getElementById('customerForm');
    
    // Validate all input fields
    form.querySelectorAll('input').forEach(input => {
        const validator = validators[input.name];
        if (validator) {
            const result = validator(input.value);
            if (!result.isValid) {
                isValid = false;
                input.setCustomValidity(result.message);
                input.reportValidity();
            }
        }
    });

    // Validate date
    const dateInput = document.getElementById('date');
    if (!dateInput.value) {
        isValid = false;
        dateInput.setCustomValidity('Please select a date');
        dateInput.reportValidity();
    }

    // Validate at least one item is selected
    const hasItems = document.querySelector('.estimate-table select[value]:not([value=""])');
    if (!hasItems) {
        isValid = false;
        alert('Please select at least one item for the estimate');
    }

    return isValid;
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
    
    // Add save button if not exists
    if (!document.querySelector('.save-button')) {
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Estimate';
        saveButton.className = 'save-button';
        saveButton.onclick = saveEstimate;
        document.querySelector('.estimate-table').after(saveButton);
    }
    
    // Initialize form validation
    const form = document.getElementById('customerForm');
    if (form) {
        form.querySelectorAll('input').forEach(input => {
            const validator = validators[input.name];
            if (validator) {
                input.addEventListener('input', () => {
                    const result = validator(input.value);
                    input.setCustomValidity(result.isValid ? '' : result.message);
                    input.reportValidity();
                });
            }
        });
    }
    
    // Calculate initial totals
    updateGrandTotal();
});

function showFeedback(message, isSuccess) {
    const feedback = document.getElementById('saveFeedback');
    feedback.style.display = 'block';
    feedback.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
    feedback.style.color = isSuccess ? '#155724' : '#721c24';
    feedback.textContent = message;
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Add save button event listener
    const saveButton = document.getElementById('saveEstimate');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            try {
                // Collect form data
                const estimateData = {
                    customer: {
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        address: document.getElementById('address').value,
                        date: document.getElementById('date').value
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

                // Save to localStorage
                let estimates = JSON.parse(localStorage.getItem('estimates') || '[]');
                estimates.push(estimateData);
                localStorage.setItem('estimates', JSON.stringify(estimates));

                // Show success message
                alert('Estimate saved successfully!');
                console.log('Saved estimate:', estimateData);

            } catch (error) {
                console.error('Save error:', error);
                alert('Error saving estimate: ' + error.message);
            }
        });
    }
});
