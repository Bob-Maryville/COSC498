// Constants for API endpoints
const API_ENDPOINTS = {
    estimates: '/api/estimates',
    estimateDetails: '/api/estimates/'
};

// Initialize estimate list functionality
document.addEventListener('DOMContentLoaded', () => {
    loadEstimates();
    initializeSearchFilters();
});

// Load all estimates from database
async function loadEstimates() {
    try {
        const response = await fetch(API_ENDPOINTS.estimates);
        const estimates = await response.json();
        displayEstimates(estimates);
    } catch (error) {
        showError('Failed to load estimates');
        console.error('Error:', error);
    }
}

// Display estimates in the list
function displayEstimates(estimates) {
    const estimateList = document.getElementById('estimate-list');
    estimateList.innerHTML = estimates.map(estimate => `
        <div class="estimate-item" data-id="${estimate.id}">
            <div class="estimate-header">
                <span class="estimate-date">${new Date(estimate.date).toLocaleDateString()}</span>
                <span class="estimate-customer">${estimate.customerName}</span>
            </div>
            <div class="estimate-total">$${estimate.total.toFixed(2)}</div>
        </div>
    `).join('');

    // Add click handlers to estimate items
    document.querySelectorAll('.estimate-item').forEach(item => {
        item.addEventListener('click', handleEstimateClick);
    });
}

// Handle estimate click
async function handleEstimateClick(event) {
    const estimateId = event.currentTarget.dataset.id;
    try {
        // Show loading state
        showLoading();
        
        const response = await fetch(`${API_ENDPOINTS.estimateDetails}${estimateId}`);
        const estimateDetails = await response.json();
        
        // Display estimate details
        displayEstimateDetails(estimateDetails);
    } catch (error) {
        showError('Failed to load estimate details');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// Utility functions for user feedback
function showLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';
}

function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}