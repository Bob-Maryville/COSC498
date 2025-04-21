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

function populateQuantityDropdowns() {
    // Only select dropdowns that have 'quantity' in their name (second column)
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

// Update the updatePrices function to include grand total calculation
function updatePrices() {
    const rows = document.querySelectorAll('.estimate-table tbody tr');
    let grandTotal = 0;
    
    rows.forEach(row => {
        const typeSelect = row.querySelector('td:first-child select');
        const quantitySelect = row.querySelector('td:nth-child(2) select');
        const priceCell = row.querySelector('.price-cell');
        const totalCell = row.querySelector('.total-cell');
        
        if (typeSelect && priceCell && quantitySelect && totalCell) {
            const itemType = typeSelect.name;
            const selectedValue = typeSelect.value;
            const quantity = parseInt(quantitySelect.value) || 0;
            
            if (ITEM_PRICES[itemType] && ITEM_PRICES[itemType][selectedValue]) {
                const unitPrice = ITEM_PRICES[itemType][selectedValue];
                const lineTotal = unitPrice * quantity;
                
                // Update unit price cell
                priceCell.textContent = `$${unitPrice.toFixed(2)}`;
                
                // Update line total cell
                totalCell.textContent = `$${lineTotal.toFixed(2)}`;
                
                // Add to grand total
                grandTotal += lineTotal;
            } else {
                priceCell.textContent = '';
                totalCell.textContent = '';
            }
        }
    });
    
    // Update or create grand total row
    let grandTotalRow = document.querySelector('.grand-total-row');
    if (!grandTotalRow) {
        const table = document.querySelector('.estimate-table table');
        grandTotalRow = document.createElement('tr');
        grandTotalRow.className = 'grand-total-row';
        grandTotalRow.innerHTML = `
            <td colspan="3" style="text-align: right"><strong>Grand Total:</strong></td>
            <td class="grand-total-cell"></td>
        `;
        table.appendChild(grandTotalRow);
    }
    
    // Update grand total amount
    const grandTotalCell = grandTotalRow.querySelector('.grand-total-cell');
    grandTotalCell.textContent = `$${grandTotal.toFixed(2)}`;
}

// Update the event listeners to trigger on both type and quantity changes
document.addEventListener('DOMContentLoaded', () => {
    // Existing quantity dropdown population code
    populateQuantityDropdowns();
    
    // Add event listeners for both type and quantity changes
    const allSelects = document.querySelectorAll('.estimate-table tbody tr select');
    allSelects.forEach(select => {
        select.addEventListener('change', updatePrices);
    });
});


function updateLineTotal(row) {
    const typeSelect = row.querySelector('select:first-child');
    const quantitySelect = row.querySelector('select:nth-child(2)');
    const priceCell = row.querySelector('.price-cell');
    const totalCell = row.querySelector('.total-cell');
    
    if (!typeSelect || !quantitySelect) return;
    
    const itemType = typeSelect.name;
    const selectedValue = typeSelect.value;
    const quantity = parseInt(quantitySelect.value) || 0;
    
    const unitPrice = ITEM_PRICES[itemType]?.[selectedValue] || 0;
    const total = unitPrice * quantity;
    
    priceCell.textContent = unitPrice ? `$${unitPrice.toFixed(2)}` : '';
    totalCell.textContent = total ? `$${total.toFixed(2)}` : '';
    
    return total;
}

function updateGrandTotal() {
    const rows = document.querySelectorAll('.estimate-table tbody tr');
    let grandTotal = 0;
    
    rows.forEach(row => {
        const lineTotal = updateLineTotal(row);
        grandTotal += lineTotal || 0;
    });
    
    // Add grand total element if not exists
    let grandTotalRow = document.querySelector('.grand-total-row');
    if (!grandTotalRow) {
        const table = document.querySelector('.estimate-table table');
        grandTotalRow = table.insertRow(-1);
        grandTotalRow.className = 'grand-total-row';
        grandTotalRow.innerHTML = `
            <td colspan="3" style="text-align: right"><strong>Grand Total:</strong></td>
            <td id="grandTotal"></td>
        `;
    }
    
    document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}



// Add form validation initialization
function initializeFormValidation() {
    const customerForm = document.getElementById('customerForm');
    if (!customerForm) return;

    // Add validation for each input
    customerForm.querySelectorAll('input').forEach(input => {
        const validator = validators[input.name];
        
        if (validator) {
            // Add input event listener
            input.addEventListener('input', () => {
                validateField(input, validator);
            });

            // Add blur event listener
            input.addEventListener('blur', () => {
                validateField(input, validator);
            });
        }
    });

    // Add date field validation
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('input', () => {
            if (!dateInput.value) {
                dateInput.setCustomValidity('Please select a date');
            } else {
                dateInput.setCustomValidity('');
            }
            dateInput.reportValidity();
        });
    }

    // Add form submit handler
    customerForm.addEventListener('submit', handleFormSubmit);
}

// Field validation function
function validateField(input, validator) {
    const result = validator(input.value);
    input.setCustomValidity(result.isValid ? '' : result.message);
    
    // Add visual feedback
    if (result.isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }
    
    input.reportValidity();
}

// Form submission handler
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    let isValid = true;
    
    // Validate all fields
    form.querySelectorAll('input').forEach(input => {
        const validator = validators[input.name];
        if (validator) {
            const result = validator(input.value);
            if (!result.isValid) {
                isValid = false;
                input.setCustomValidity(result.message);
                input.reportValidity();
            }
        } else if (input.type === 'date' && !input.value) {
            isValid = false;
            input.setCustomValidity('Please select a date');
            input.reportValidity();
        }
    });
    
    if (isValid) {
        // Form is valid, you can proceed with submission
        console.log('Form is valid - ready for submission');
        // Add your form submission logic here
    }
}

// Add CSS for validation feedback
const style = document.createElement('style');
style.textContent = `
    .form-group input.valid {
        border-color: #28a745;
        background-color: #f8fff9;
    }
    
    .form-group input.invalid {
        border-color: #dc3545;
        background-color: #fff8f8;
    }
`;
document.head.appendChild(style);

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFormValidation();
});

document.addEventListener('DOMContentLoaded', () => {
    // Populate quantity dropdowns
    populateQuantityDropdowns();
    
    // Add change event listeners to all selects
    document.querySelectorAll('.estimate-table select').forEach(select => {
        select.addEventListener('change', (event) => {
            const row = event.target.closest('tr');
            if (row) {
                updateLineTotal(row);
                updateGrandTotal();
            }
        });
    });
    
    // OLD version to replace:
    const customerForm = document.getElementById('customerForm');
    customerForm.querySelectorAll('input').forEach(input => {
        const validator = validators[input.name];
        if (validator) {
            input.addEventListener('input', () => {
                const result = validator(input.value);
                input.setCustomValidity(result.isValid ? '' : result.message);
            });
        }
    });
    
    // Handle form submission
    customerForm.addEventListener('submit', handleFormSubmit);
});



// Update the updatePrices function to include grand total calculation
function updatePrices() {
    const rows = document.querySelectorAll('.estimate-table tbody tr');
    let grandTotal = 0;
    
    rows.forEach(row => {
        const typeSelect = row.querySelector('td:first-child select');
        const quantitySelect = row.querySelector('td:nth-child(2) select');
        const priceCell = row.querySelector('.price-cell');
        const totalCell = row.querySelector('.total-cell');
        
        if (typeSelect && priceCell && quantitySelect && totalCell) {
            const itemType = typeSelect.name;
            const selectedValue = typeSelect.value;
            const quantity = parseInt(quantitySelect.value) || 0;
            
            if (ITEM_PRICES[itemType] && ITEM_PRICES[itemType][selectedValue]) {
                const unitPrice = ITEM_PRICES[itemType][selectedValue];
                const lineTotal = unitPrice * quantity;
                
                // Update unit price cell
                priceCell.textContent = `$${unitPrice.toFixed(2)}`;
                
                // Update line total cell
                totalCell.textContent = `$${lineTotal.toFixed(2)}`;
                
                // Add to grand total
                grandTotal += lineTotal;
            } else {
                priceCell.textContent = '';
                totalCell.textContent = '';
            }
        }
    });
    
    // Update or create grand total row
    let grandTotalRow = document.querySelector('.grand-total-row');
    if (!grandTotalRow) {
        const table = document.querySelector('.estimate-table table');
        grandTotalRow = document.createElement('tr');
        grandTotalRow.className = 'grand-total-row';
        grandTotalRow.innerHTML = `
            <td colspan="3" style="text-align: right"><strong>Grand Total:</strong></td>
            <td class="grand-total-cell"></td>
        `;
        table.appendChild(grandTotalRow);
    }
    
    // Update grand total amount
    const grandTotalCell = grandTotalRow.querySelector('.grand-total-cell');
    grandTotalCell.textContent = `$${grandTotal.toFixed(2)}`;
}


function updateLineTotal(row) {
    const typeSelect = row.querySelector('select:first-child');
    const quantitySelect = row.querySelector('select:nth-child(2)');
    const priceCell = row.querySelector('.price-cell');
    const totalCell = row.querySelector('.total-cell');
    
    if (!typeSelect || !quantitySelect) return;
    
    const itemType = typeSelect.name;
    const selectedValue = typeSelect.value;
    const quantity = parseInt(quantitySelect.value) || 0;
    
    const unitPrice = ITEM_PRICES[itemType]?.[selectedValue] || 0;
    const total = unitPrice * quantity;
    
    priceCell.textContent = unitPrice ? `$${unitPrice.toFixed(2)}` : '';
    totalCell.textContent = total ? `$${total.toFixed(2)}` : '';
    
    return total;
}

function updateGrandTotal() {
    const rows = document.querySelectorAll('.estimate-table tbody tr');
    let grandTotal = 0;
    
    rows.forEach(row => {
        const lineTotal = updateLineTotal(row);
        grandTotal += lineTotal || 0;
    });
    
    // Add grand total element if not exists
    let grandTotalRow = document.querySelector('.grand-total-row');
    if (!grandTotalRow) {
        const table = document.querySelector('.estimate-table table');
        grandTotalRow = table.insertRow(-1);
        grandTotalRow.className = 'grand-total-row';
        grandTotalRow.innerHTML = `
            <td colspan="3" style="text-align: right"><strong>Grand Total:</strong></td>
            <td id="grandTotal"></td>
        `;
    }
    
    document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
}

// OLD version to replace:
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

// Add form validation initialization
function initializeFormValidation() {
    const customerForm = document.getElementById('customerForm');
    if (!customerForm) return;

    // Add validation for each input
    customerForm.querySelectorAll('input').forEach(input => {
        const validator = validators[input.name];
        
        if (validator) {
            // Add input event listener
            input.addEventListener('input', () => {
                validateField(input, validator);
            });

            // Add blur event listener
            input.addEventListener('blur', () => {
                validateField(input, validator);
            });
        }
    });

    // Add date field validation
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('input', () => {
            if (!dateInput.value) {
                dateInput.setCustomValidity('Please select a date');
            } else {
                dateInput.setCustomValidity('');
            }
            dateInput.reportValidity();
        });
    }

    // Add form submit handler
    customerForm.addEventListener('submit', handleFormSubmit);
}

// Field validation function
function validateField(input, validator) {
    const result = validator(input.value);
    input.setCustomValidity(result.isValid ? '' : result.message);
    
    // Add visual feedback
    if (result.isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }
    
    input.reportValidity();
}

// Form submission handler
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    let isValid = true;
    
    // Validate all fields
    form.querySelectorAll('input').forEach(input => {
        const validator = validators[input.name];
        if (validator) {
            const result = validator(input.value);
            if (!result.isValid) {
                isValid = false;
                input.setCustomValidity(result.message);
                input.reportValidity();
            }
        } else if (input.type === 'date' && !input.value) {
            isValid = false;
            input.setCustomValidity('Please select a date');
            input.reportValidity();
        }
    });
    
    if (isValid) {
        // Form is valid, you can proceed with submission
        console.log('Form is valid - ready for submission');
        // Add your form submission logic here
    }
}

// Add CSS for validation feedback
const style = document.createElement('style');
style.textContent = `
    .form-group input.valid {
        border-color: #28a745;
        background-color: #f8fff9;
    }
    
    .form-group input.invalid {
        border-color: #dc3545;
        background-color: #fff8f8;
    }
`;
document.head.appendChild(style);

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFormValidation();
});

