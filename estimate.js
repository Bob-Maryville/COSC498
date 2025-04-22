// Price constants
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

// Dropdown population
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

// Price calculation functions
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

function updateGrandTotal() {
    const rows = document.querySelectorAll('.estimate-table tbody tr');
    let grandTotal = 0;
    
    rows.forEach(row => {
        const lineTotal = updateLineTotal(row);
        grandTotal += lineTotal;
    });
    
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
    
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
}

// Utility functions
function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
}

// Form validation functions
function validateField(input, validator) {
    const result = validator(input.value);
    input.setCustomValidity(result.isValid ? '' : result.message);
    
    input.classList.toggle('valid', result.isValid);
    input.classList.toggle('invalid', !result.isValid);
    
    input.reportValidity();
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    let isValid = true;
    
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
        console.log('Form is valid - ready for submission');
        // Add your form submission logic here
    }
}

function initializeFormValidation() {
    const customerForm = document.getElementById('customerForm');
    if (!customerForm) return;

    customerForm.querySelectorAll('input').forEach(input => {
        const validator = validators[input.name];
        if (validator) {
            input.addEventListener('input', () => validateField(input, validator));
            input.addEventListener('blur', () => validateField(input, validator));
        }
    });

    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('input', () => {
            dateInput.setCustomValidity(dateInput.value ? '' : 'Please select a date');
            dateInput.reportValidity();
        });
    }

    customerForm.addEventListener('submit', handleFormSubmit);
}

// Add validation styles
const validationStyles = `
    .form-group input.valid {
        border-color: #28a745;
        background-color: #f8fff9;
    }
    
    .form-group input.invalid {
        border-color: #dc3545;
        background-color: #fff8f8;
    }
`;

// Single initialization point
document.addEventListener('DOMContentLoaded', () => {
    // Add validation styles
    const style = document.createElement('style');
    style.textContent = validationStyles;
    document.head.appendChild(style);

    // Initialize dropdowns
    populateQuantityDropdowns();
    
    // Add event listeners for price updates
    document.querySelectorAll('.estimate-table select').forEach(select => {
        select.addEventListener('change', (event) => {
            const row = event.target.closest('tr');
            if (row) {
                updateLineTotal(row);
                updateGrandTotal();
            }
        });
    });
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initial calculation of totals
    updateGrandTotal();
});

// Function to collect all form and estimate data
function collectEstimateData() {
    const customerData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        date: document.getElementById('date').value
    };

    // Collect line items
    const lineItems = [];
    document.querySelectorAll('.estimate-table tbody tr').forEach(row => {
        const typeSelect = row.querySelector('td:first-child select');
        const quantitySelect = row.querySelector('td:nth-child(2) select');
        const priceCell = row.querySelector('.price-cell');
        const totalCell = row.querySelector('.total-cell');
        
        if (typeSelect && typeSelect.value) {
            lineItems.push({
                itemType: typeSelect.name,
                selectedItem: typeSelect.value,
                quantity: parseInt(quantitySelect.value) || 0,
                unitPrice: parseFloat(priceCell.textContent.replace('$', '')) || 0,
                lineTotal: parseFloat(totalCell.textContent.replace('$', '')) || 0
            });
        }
    });

    // Get grand total
    const grandTotal = document.querySelector('#grandTotal')?.textContent.replace('$', '') || '0';

    return {
        customer: customerData,
        items: lineItems,
        totalAmount: parseFloat(grandTotal)
    };
}

// Function to save estimate
async function saveEstimate() {
    try {
        // Show loading state
        const saveButton = document.getElementById('saveEstimate');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;

        // Collect data
        const estimateData = collectEstimateData();

        // Send to server
        const response = await fetch('save_estimate.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(estimateData)
        });

        const result = await response.json();

        if (result.success) {
            showFeedback('Estimate saved successfully!', true);
            setTimeout(() => {
                window.location.href = 'find-estimate.html';
            }, 2000);
        } else {
            throw new Error(result.message || 'Failed to save estimate');
        }
    } catch (error) {
        showFeedback(error.message, false);
    } finally {
        // Reset button state
        const saveButton = document.getElementById('saveEstimate');
        saveButton.textContent = 'Save Estimate';
        saveButton.disabled = false;
    }
}

// Function to show feedback messages
function showFeedback(message, isSuccess) {
    const feedbackDiv = document.getElementById('feedback') || document.createElement('div');
    feedbackDiv.id = 'feedback';
    feedbackDiv.className = `feedback-message ${isSuccess ? 'success' : 'error'}`;
    feedbackDiv.textContent = message;
    
    if (!document.getElementById('feedback')) {
        document.querySelector('.button-container').insertAdjacentElement('beforebegin', feedbackDiv);
    }
    
    setTimeout(() => feedbackDiv.remove(), 5000);
}

// Add event listener for save button
document.addEventListener('DOMContentLoaded', () => {
    // Add save button event listener
    const saveButton = document.getElementById('saveEstimate');
    if (saveButton) {
        saveButton.addEventListener('click', saveEstimate);
    }
});
