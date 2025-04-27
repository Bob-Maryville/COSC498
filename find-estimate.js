document.addEventListener('DOMContentLoaded', () => {
    // Debug: Check if estimates exist in localStorage
    console.log('Initial estimates:', localStorage.getItem('estimates'));
    
    // Load and display estimates
    loadEstimates();
    
    // Set up search filter functionality
    setupSearchFilter();
    
    // Set up sort functionality
    setupSortDropdown();
});

function setupSearchFilter() {
    // Create and append the search filter to the page
    const table = document.querySelector('.estimates-table');
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-input-wrapper">
            <input type="text" id="search-filter" placeholder="Search estimates by customer name..." />
            <button id="clear-search" class="clear-button">&times;</button>
        </div>
    `;
    
    // Insert the search container before the table
    if (table && table.parentNode) {
        table.parentNode.insertBefore(searchContainer, table);
    }
    
    // Add event listener for input changes
    const searchInput = document.getElementById('search-filter');
    if (searchInput) {
        searchInput.addEventListener('input', filterEstimates);
    }
    
    // Add clear button functionality
    const clearButton = document.getElementById('clear-search');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                filterEstimates();
            }
        });
    }
}

function setupSortDropdown() {
    // Create sort container and dropdown
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-container';
    sortContainer.innerHTML = `
        <label for="sort-dropdown">Sort by:</label>
        <select id="sort-dropdown">
            <option value="name">Customer Name</option>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
        </select>
    `;
    
    // Get the search container to place the sort dropdown next to it
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && searchContainer.parentNode) {
        // Create a filter controls container to hold both search and sort
        const filterControls = document.createElement('div');
        filterControls.className = 'filter-controls';
        
        // Move search container into filter controls
        searchContainer.parentNode.insertBefore(filterControls, searchContainer);
        filterControls.appendChild(searchContainer);
        
        // Add sort container to filter controls
        filterControls.appendChild(sortContainer);
    } else {
        // If search container doesn't exist, add sort container before the table
        const table = document.querySelector('.estimates-table');
        if (table && table.parentNode) {
            table.parentNode.insertBefore(sortContainer, table);
        }
    }
    
    // Add event listener for sort dropdown changes
    const sortDropdown = document.getElementById('sort-dropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', () => {
            sortEstimates(sortDropdown.value);
        });
    }
}

function sortEstimates(sortBy) {
    try {
        // Get estimates from localStorage
        const estimatesJson = localStorage.getItem('estimates');
        if (!estimatesJson) return;
        
        const estimates = JSON.parse(estimatesJson) || [];
        if (!estimates.length) return;
        
        // Sort the estimates based on the selected criteria
        let sortedEstimates = [...estimates];
        
        switch (sortBy) {
            case 'name':
                sortedEstimates.sort((a, b) => {
                    const nameA = (a.customer?.name || '').toLowerCase();
                    const nameB = (b.customer?.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
                
            case 'date':
                sortedEstimates.sort((a, b) => {
                    const dateA = a.date ? new Date(a.date) : new Date(0);
                    const dateB = b.date ? new Date(b.date) : new Date(0);
                    return dateB - dateA; // Newest first
                });
                break;
                
            case 'amount':
                sortedEstimates.sort((a, b) => {
                    // Extract amount values and convert to numbers
                    const getAmount = (est) => {
                        if (!est.totalAmount) return 0;
                        const amountStr = est.totalAmount.toString().replace(/[^0-9.-]+/g, '');
                        return parseFloat(amountStr) || 0;
                    };
                    
                    const amountA = getAmount(a);
                    const amountB = getAmount(b);
                    
                    return amountB - amountA; // Highest first
                });
                break;
                
            default:
                // Default sort by name
                sortedEstimates.sort((a, b) => {
                    const nameA = (a.customer?.name || '').toLowerCase();
                    const nameB = (b.customer?.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
        }
        
        // Display the sorted estimates
        displayEstimates(sortedEstimates);
        
        // Re-apply search filter
        filterEstimates();
        
    } catch (error) {
        console.error('Error sorting estimates:', error);
    }
}

function filterEstimates() {
    const searchInput = document.getElementById('search-filter');
    const searchTerm = searchInput?.value.toLowerCase().trim() || '';
    
    // Get all estimate rows
    const estimateRows = document.querySelectorAll('.estimates-table tbody tr');
    let visibleCount = 0;
    
    // Filter the rows based on search term
    estimateRows.forEach(row => {
        // Skip the "no estimates found" row
        if (row.cells.length === 1 && row.cells[0].colSpan === 3) {
            return;
        }
        
        const rowText = row.textContent.toLowerCase();
        if (searchTerm === '' || rowText.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show or hide "no results" message
    updateNoResultsMessage(searchTerm, visibleCount);
}

function updateNoResultsMessage(searchTerm, visibleCount) {
    // Remove existing no results message if it exists
    const existingMessage = document.getElementById('no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // If no visible rows and we have a search term, show the message
    if (visibleCount === 0 && searchTerm) {
        const tableBody = document.querySelector('.estimates-table tbody');
        if (tableBody) {
            // Clear the existing content
            tableBody.innerHTML = '';
            
            // Add the no results row
            const noResultsRow = document.createElement('tr');
            noResultsRow.id = 'no-results-message';
            noResultsRow.innerHTML = `<td colspan="3">No estimates found matching "${searchTerm}"</td>`;
            tableBody.appendChild(noResultsRow);
        }
    } else if (visibleCount === 0) {
        // If no visible rows and no search term, show the default "no estimates" message
        const tableBody = document.querySelector('.estimates-table tbody');
        if (tableBody && tableBody.childElementCount === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">No estimates found</td></tr>';
        }
    }
}

function loadEstimates() {
    try {
        // Get and parse estimates from localStorage
        const estimatesJson = localStorage.getItem('estimates');
        console.log('Raw estimates from localStorage:', estimatesJson);
        
        const estimates = JSON.parse(estimatesJson) || [];
        console.log('Parsed estimates:', estimates);
        
        // Display the estimates
        displayEstimates(estimates);
        
    } catch (error) {
        console.error('Error in loadEstimates:', error);
        const tableBody = document.querySelector('.estimates-table tbody');
        tableBody.innerHTML = '<tr><td colspan="3">Error loading estimates</td></tr>';
    }
}

function displayEstimates(estimates) {
    const tableBody = document.querySelector('.estimates-table tbody');
    
    if (!estimates || !estimates.length) {
        tableBody.innerHTML = '<tr><td colspan="3">No estimates found</td></tr>';
        return;
    }
    
    // Update table to include amount column if not already present
    const tableHeaders = document.querySelectorAll('.estimates-table th');
    if (tableHeaders.length === 3 && !Array.from(tableHeaders).some(th => th.textContent === 'Amount')) {
        // Add amount header
        const headerRow = tableHeaders[0].parentElement;
        const amountHeader = document.createElement('th');
        amountHeader.textContent = 'Amount';
        headerRow.insertBefore(amountHeader, headerRow.lastElementChild);
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
        
        // Format the date if it exists
        let date = 'No date';
        if (estimate.date) {
            try {
                date = new Date(estimate.date).toLocaleDateString();
            } catch (e) {
                console.error('Error formatting date:', e);
                date = estimate.date;
            }
        }
        
        // Get amount
        const amount = estimate.totalAmount || '$0.00';

        return `
            <tr>
                <td><a href="#" class="estimate-link" data-id="${id}">${name}</a></td>
                <td>${date}</td>
                <td>${amount}</td>
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
        
        // Reload the estimates table with current sort selection
        const sortDropdown = document.getElementById('sort-dropdown');
        if (sortDropdown && sortDropdown.value) {
            sortEstimates(sortDropdown.value);
        } else {
            loadEstimates();
        }
        
        // Apply search filter again to maintain consistency
        filterEstimates();
        
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
                date: est.date,
                amount: est.totalAmount
            });
        });
    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Call this function when page loads
document.addEventListener('DOMContentLoaded', debugEstimates);