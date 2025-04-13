const ITEM_PRICES = {
    shingleType: {
        '3-tab': 75.00,
        'architectural': 95.00,
        'designer': 125.00
    },
    roofSize: {
        'flat': 200.00,
        'standard': 300.00,
        'steep': 450.00
    },
    ventType: {
        'box': 45.00,
        'turbine': 65.00,
        'ridge': 85.00
    },
    chimneyFlashingSize: {
        'small': 150.00,
        'medium': 200.00,
        'large': 250.00
    },
    underlaymentType: {
        'felt': 35.00,
        'synthetic': 55.00
    },
    dumpsterSize: {
        'dump-small': 350.00,
        'dump-medium': 450.00,
        'dump-large': 550.00
    }
};

function populateQuantityDropdowns() {
    const quantitySelects = document.querySelectorAll('select[name$="quantity"], select[name$="size"]');
    
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
        isValid: /^\+?[1-9][0-9]{7,14}$/.test(value),
        message: 'Please enter a valid phone number'
    }),
    address: (value) => ({
        isValid: value.length >= 5 && value.length <= 100,
        message: 'Address must be between 5 and 100 characters'
    })
};

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
    
    // Add form validation
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