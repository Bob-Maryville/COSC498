document.addEventListener('DOMContentLoaded', () => {
    console.log('Purchase Order Details page loaded');
    
    const id = getPurchaseOrderId();
    if (!id) {
        displayError('No purchase order ID provided');
        return;
    }

    const purchaseOrder = getPurchaseOrder(id);
    if (!purchaseOrder) {
        displayError(`Purchase order with ID ${id} not found`);
        return;
    }

    displayPurchaseOrder(purchaseOrder);
    
    // Add print functionality
    document.getElementById('print-button')?.addEventListener('click', () => {
        window.print();
    });
});

function getPurchaseOrderId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getPurchaseOrder(id) {
    try {
        const purchaseOrdersJson = localStorage.getItem('purchaseOrders');
        console.log('Raw purchase orders from localStorage:', purchaseOrdersJson);
        
        if (!purchaseOrdersJson) {
            console.log('No purchase orders found in localStorage');
            return null;
        }

        const purchaseOrders = JSON.parse(purchaseOrdersJson);
        const purchaseOrder = purchaseOrders.find(po => po.id.toString() === id.toString());
        console.log('Found purchase order:', purchaseOrder);
        
        return purchaseOrder;
    } catch (error) {
        console.error('Error getting purchase order:', error);
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

function displayPurchaseOrder(purchaseOrder) {
    const container = document.getElementById('purchase-order-details');
    if (!container) {
        console.error('Purchase order details container not found');
        return;
    }

    try {
        // Ensure purchase order has required properties
        if (!purchaseOrder || !purchaseOrder.customer) {
            throw new Error('Invalid purchase order data');
        }

        // Ensure items array exists
        const items = purchaseOrder.items || [];
        console.log('Items to display:', items);
        
        // Format the date
        const formattedDate = formatDate(purchaseOrder.poDate || purchaseOrder.createdAt);
        
        // Get today's date for "generated on" text
        const today = new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }).format(new Date());

        const html = `
            <div class="purchase-order-container">
                <div class="po-header">
                    <div class="company-info">
                        <h1>Purchase Order</h1>
                        <h2>Bob's Roofing Company</h2>
                        <p>123 Main Street, St. Louis, MO 63101</p>
                        <p>Phone: (314) 123-4567</p>
                        <p>Email: info@bobsroofingcompany.com</p>
                    </div>
                    <div class="po-meta">
                        <div class="po-number">
                            <h3>PO #</h3>
                            <p>${purchaseOrder.id}</p>
                        </div>
                        <div class="po-date">
                            <h3>Date</h3>
                            <p>${formattedDate}</p>
                        </div>
                    </div>
                </div>

                <div class="customer-section">
                    <h2>Customer Information</h2>
                    <div class="customer-details">
                        <p><strong>Name:</strong> ${purchaseOrder.customer.name || 'N/A'}</p>
                        <p><strong>Address:</strong> ${purchaseOrder.customer.address || 'N/A'}</p>
                        <p><strong>Email:</strong> ${purchaseOrder.customer.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${purchaseOrder.customer.phone || 'N/A'}</p>
                    </div>
                </div>

                <div class="items-section">
                    <h2>Order Details</h2>
                    <table class="po-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.length > 0 ? items.map(item => {
                                // Calculate PO price (1/3 of estimate price)
                                const originalPrice = parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
                                const poPrice = (originalPrice / 3).toFixed(2);
                                
                                return `
                                    <tr>
                                        <td>${formatItemType(item.type || '')}</td>
                                        <td>${formatSelectionName(item.selection || '')}</td>
                                        <td class="text-center">${item.quantity || '0'}</td>
                                        <td class="text-right">$${poPrice}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="4" class="text-center">No items found</td></tr>'}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="total-label">Total Amount:</td>
                                <td class="grand-total">${purchaseOrder.totalAmount || '$0.00'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="terms-section">
                    <h2>Terms & Conditions</h2>
                    <p>1. This purchase order represents 1/3 of the total project cost as deposit.</p>
                    <p>2. Materials will be ordered upon receipt of this deposit.</p>
                    <p>3. Delivery schedule will be confirmed after order processing.</p>
                    <p>4. All materials remain property of Bob's Roofing until final payment.</p>
                </div>
                
                <div class="signature-section">
                    <div class="signature-line">
                        <div class="line"></div>
                        <p>Authorized Signature</p>
                    </div>
                    <div class="signature-line">
                        <div class="line"></div>
                        <p>Date</p>
                    </div>
                </div>
                
                <div class="po-footer">
                    <p>Generated on ${today}</p>
                </div>
                
                <div class="actions">
                    <button id="print-button" class="button primary-button">Print Purchase Order</button>
                    <a href="find-purchase-order.html" class="button secondary-button">Back to Purchase Orders</a>
                </div>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.error('Error displaying purchase order:', error);
        displayError('Error displaying purchase order details');
    }
}

function displayError(message) {
    const container = document.getElementById('purchase-order-details');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="find-purchase-order.html" class="button secondary-button">Return to Purchase Orders List</a>
            </div>
        `;
    }
}