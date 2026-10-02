// Admin panel functionality
let currentEditingProductId = null;

// Check admin authentication
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
        alert('Access denied. Admin only.');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Tab navigation
function setupTabs() {
    const tabLinks = document.querySelectorAll('[data-tab]');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(tab => tab.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).style.display = 'block';
            
            // Load tab data
            loadTabData(this.getAttribute('data-tab'));
        });
    });
}

// Load data for specific tab
function loadTabData(tabName) {
    console.log(`🔄 Loading ${tabName} data...`);
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');
        
        // Get orders first to calculate revenue
        const ordersResponse = await axios.get('/api/orders', {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
        });
        const orders = ordersResponse.data;

        // Get products and users
        const [productsResponse, usersResponse] = await Promise.all([
            axios.get('/api/products'),
            axios.get('/api/users', {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            })
        ]);

        const products = productsResponse.data;
        const users = usersResponse.data;

        console.log('📦 Data loaded:', {
            orders: orders.length,
            products: products.length,
            users: users.length
        });

        // Update dashboard cards
        document.getElementById('total-products').textContent = products.length;
        document.getElementById('total-orders').textContent = orders.length;
        document.getElementById('total-users').textContent = users.length;
        
        // Calculate total revenue from completed/paid orders
        const totalRevenue = orders
            .filter(order => order.status === 'paid' || order.status === 'completed')
            .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
        
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;

        // Load recent orders (last 5)
        const recentOrders = orders.slice(0, 5);
        const recentOrdersContainer = document.getElementById('recent-orders');
        
        if (recentOrders.length === 0) {
            recentOrdersContainer.innerHTML = '<p class="text-muted text-center">No recent orders</p>';
        } else {
            recentOrdersContainer.innerHTML = recentOrders.map(order => {
                const orderDate = new Date(order.createdAt).toLocaleDateString();
                const statusClass = order.status === 'paid' ? 'bg-success' : 
                                  order.status === 'pending' ? 'bg-warning' : 'bg-secondary';
                
                return `
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                        <div>
                            <strong>Order #${order.id}</strong>
                            <br>
                            <small class="text-muted">$${parseFloat(order.totalAmount).toFixed(2)} • ${orderDate}</small>
                        </div>
                        <span class="badge ${statusClass}">${order.status}</span>
                    </div>
                `;
            }).join('');
        }

        // Load low stock products (stock < 10)
        const lowStockProducts = products.filter(p => p.stock_quantity < 10);
        const lowStockContainer = document.getElementById('low-stock-products');
        
        if (lowStockProducts.length === 0) {
            lowStockContainer.innerHTML = '<p class="text-muted text-center">All products have sufficient stock</p>';
        } else {
            lowStockContainer.innerHTML = lowStockProducts.map(product => `
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div>
                        <strong>${product.name}</strong>
                        <br>
                        <small class="text-muted">Stock: ${product.stock_quantity}</small>
                    </div>
                    <span class="badge bg-warning">Low Stock</span>
                </div>
            `).join('');
        }

        console.log('✅ Dashboard data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        
        // Show error messages in the containers
        document.getElementById('recent-orders').innerHTML = 
            '<p class="text-danger text-center">Error loading recent orders</p>';
        document.getElementById('low-stock-products').innerHTML = 
            '<p class="text-danger text-center">Error loading stock data</p>';
    }
}





// Load orders for management
async function loadOrders() {
    try {
        console.log('📋 Loading orders...');
        
        const response = await axios.get('/api/orders', {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
        });
        const orders = response.data;
        
        console.log('✅ Orders loaded:', orders);
        
        const tableBody = document.getElementById('orders-table');
        
        if (orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        No orders found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = orders.map(order => {
            // Parse shipping address to get customer name
            let customerName = 'Unknown Customer';
            let customerEmail = 'No email';
            try {
                const shippingAddress = typeof order.shippingAddress === 'string' 
                    ? JSON.parse(order.shippingAddress) 
                    : order.shippingAddress;
                customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
                customerEmail = shippingAddress.email || 'No email';
            } catch (e) {
                console.warn('Could not parse shipping address for order:', order.id);
            }
            
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            const statusClass = getStatusClass(order.status);
            
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>
                        <div><strong>${customerName}</strong></div>
                        <small class="text-muted">${customerEmail}</small>
                    </td>
                    <td>$${parseFloat(order.totalAmount).toFixed(2)}</td>
                    <td>
                        <select class="form-select form-select-sm" id="status-${order.id}" onchange="updateOrderStatus(${order.id})">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            <option value="refunded" ${order.status === 'refunded' ? 'selected' : ''}>Refunded</option>
                        </select>
                    </td>
                    <td>
                        <span class="badge ${statusClass}">${order.status}</span>
                    </td>
                    <td>${orderDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="viewOrderDetails(${order.id})">
                            View Details
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="sendShippingNotification(${order.id})">
                            📧 Notify
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        const tableBody = document.getElementById('orders-table');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    Error loading orders: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Get status badge class
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-warning',
        'paid': 'bg-info',
        'processing': 'bg-primary',
        'shipped': 'bg-success',
        'completed': 'bg-success',
        'cancelled': 'bg-danger',
        'refunded': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
}

// Update order status
async function updateOrderStatus(orderId) {
    const statusSelect = document.getElementById(`status-${orderId}`);
    const newStatus = statusSelect.value;
    
    if (!confirm(`Change order #${orderId} status to "${newStatus}"?`)) {
        // Reset to original value if cancelled
        loadOrders(); // Reload to get original status
        return;
    }

    try {
        console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
        
        const response = await axios.put(`/api/orders/${orderId}/status`, {
            status: newStatus
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('✅ Order status updated:', response.data);
        
        // Show success message
        showOrderMessage(`Order #${orderId} status updated to ${newStatus}`, 'success');
        
        // Reload orders and dashboard to reflect changes
        loadOrders();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        showOrderMessage(`Failed to update order status: ${error.message}`, 'danger');
        // Reload to reset the select to original value
        loadOrders();
    }
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const response = await axios.get(`/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const order = response.data;
        
        // Parse shipping address
        const shippingAddress = typeof order.shippingAddress === 'string' 
            ? JSON.parse(order.shippingAddress) 
            : order.shippingAddress;
        
        // Create modal HTML for order details
        const orderDetailsHTML = `
            <div class="order-details">
                <h4>Order #${order.id}</h4>
                <div class="row">
                    <div class="col-md-6">
                        <h6>Customer Information</h6>
                        <p><strong>Name:</strong> ${shippingAddress.firstName} ${shippingAddress.lastName}</p>
                        <p><strong>Email:</strong> ${shippingAddress.email}</p>
                        <p><strong>Phone:</strong> ${shippingAddress.phone}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Order Information</h6>
                        <p><strong>Status:</strong> <span class="badge ${getStatusClass(order.status)}">${order.status}</span></p>
                        <p><strong>Total:</strong> $${parseFloat(order.totalAmount).toFixed(2)}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                
                <div class="mt-3">
                    <h6>Shipping Address</h6>
                    <p>
                        ${shippingAddress.address}<br>
                        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                        ${shippingAddress.country}
                    </p>
                </div>
                
                <div class="mt-3">
                    <h6>Order Items</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.orderItems ? order.orderItems.map(item => `
                                    <tr>
                                        <td>${item.product ? item.product.name : 'Product #' + item.productId}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${parseFloat(item.unitPrice).toFixed(2)}</td>
                                        <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4">No items found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                ${order.stripePaymentIntentId ? `
                    <div class="mt-3">
                        <h6>Payment Information</h6>
                        <p><strong>Stripe Payment ID:</strong> ${order.stripePaymentIntentId}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Create and show modal
        showOrderModal('Order Details', orderDetailsHTML);
        
    } catch (error) {
        console.error('❌ Error loading order details:', error);
        alert('Error loading order details: ' + error.message);
    }
}

// Send shipping notification
async function sendShippingNotification(orderId) {
    if (!confirm(`Send shipping notification for order #${orderId}?`)) {
        return;
    }

    try {
        const response = await axios.post(`/api/orders/${orderId}/notify-shipping`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        showOrderMessage(`Shipping notification sent for order #${orderId}`, 'success');
        
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        showOrderMessage(`Failed to send notification: ${error.message}`, 'danger');
    }
}

// Show order message
function showOrderMessage(message, type) {
    // Create toast notification
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.innerHTML += toastHTML;
    
    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast after hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
    return toastContainer;
}

// Show order modal
function showOrderModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modalHTML = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}


// Load products for management
async function loadProducts() {
    try {
        const response = await axios.get('/api/products');
        const products = response.data;
        
        const tableBody = document.getElementById('products-table');
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No products found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.image_url || 'https://via.placeholder.com/50x50?text=No+Image'}" 
                         alt="${product.name}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td>${product.name}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <span class="badge ${product.stock_quantity < 10 ? 'bg-warning' : 'bg-success'}">
                        ${product.stock_quantity}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" 
                            onclick="editProduct(${product.id})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load users for management
async function loadUsers() {
    try {
        const response = await axios.get('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const users = response.data;
        
        const tableBody = document.getElementById('users-table');
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No users found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">
                        ${user.role}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    ${user.role !== 'admin' ? 
                        `<button class="btn btn-sm btn-outline-warning" 
                                onclick="makeAdmin(${user.id})">
                            Make Admin
                         </button>` : 
                        '<span class="text-muted">Admin</span>'
                    }
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        if (error.response?.status === 401) {
            alert('Session expired. Please login again.');
            logout();
        }
    }
}

// View order details
function viewOrderDetails(orderId) {
    alert(`Viewing order #${orderId}\n\nThis would open a detailed order view in a real application.`);
    // In a real app, you would show a modal with order details
}

// Product form handling
document.getElementById('save-product').addEventListener('click', async function() {
    const formData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock_quantity: parseInt(document.getElementById('product-stock').value),
        image_url: document.getElementById('product-image').value
    };

    try {
        if (currentEditingProductId) {
            // Update existing product
            await axios.put(`/api/products/${currentEditingProductId}`, formData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
        } else {
            // Create new product
            await axios.post('/api/products', formData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
        }

        // Close modal and reload products
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        resetProductForm();
        loadProducts();
        loadDashboardData(); // Refresh dashboard stats
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + (error.response?.data?.message || error.message));
    }
});

// Edit product
async function editProduct(productId) {
    try {
        const response = await axios.get(`/api/products/${productId}`);
        const product = response.data;
        
        // Fill form with product data
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock_quantity;
        document.getElementById('product-image').value = product.image_url || '';
        
        // Update modal title
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        currentEditingProductId = productId;
        
        // Show modal
        new bootstrap.Modal(document.getElementById('productModal')).show();
        
    } catch (error) {
        console.error('Error loading product for edit:', error);
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await axios.delete(`/api/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        loadProducts();
        loadDashboardData(); // Refresh dashboard stats
        
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + (error.response?.data?.message || error.message));
    }
}

// Reset product form
function resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    currentEditingProductId = null;
}

// Make user admin
async function makeAdmin(userId) {
    if (!confirm('Are you sure you want to make this user an admin?')) {
        return;
    }

    try {
        await axios.put(`/api/users/${userId}/make-admin`, {}, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        loadUsers();
        
    } catch (error) {
        console.error('Error making user admin:', error);
        alert('Error making user admin: ' + (error.response?.data?.message || error.message));
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin panel loading...');
    
    if (!checkAdminAuth()) return;
    
    setupTabs();
    loadDashboardData(); // Load default tab data
    
    // Reset product form when modal is hidden
    document.getElementById('productModal').addEventListener('hidden.bs.modal', resetProductForm);
    
    // Add logout event listener
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    console.log('✅ Admin panel initialized');
});