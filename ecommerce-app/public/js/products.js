let allProducts = [];
let currentProductId = null;

// Load all products
async function loadProducts() {
    try {
        showLoading(true);
        const response = await axios.get('/api/products');
        allProducts = response.data;
        displayProducts(allProducts);
        showLoading(false);
    } catch (error) {
        console.error('Error loading products:', error);
        showLoading(false);
        showNoProducts(true, 'Error loading products. Please try again.');
    }
}

// Display products in the grid
function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (products.length === 0) {
        showNoProducts(true);
        return;
    }
    
    showNoProducts(false);
    
    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card product-card h-100">
                <img src="${product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     class="card-img-top" 
                     alt="${product.name}"
                     style="height: 200px; object-fit: cover; cursor: pointer;"
                     onclick="showProductDetails(${product.id})">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text flex-grow-1">${product.description ? product.description.substring(0, 100) : 'No description available'}...</p>
                    <div class="mt-auto">
                        <p class="card-text"><strong>$${parseFloat(product.price).toFixed(2)}</strong></p>
                        <div class="d-grid gap-2">
                            <button onclick="addToCart(${product.id})" class="btn btn-primary">Add to Cart</button>
                            <button onclick="showProductDetails(${product.id})" class="btn btn-outline-secondary">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Show product details in modal
async function showProductDetails(productId) {
    try {
        const response = await axios.get(`/api/products/${productId}`);
        const product = response.data;
        currentProductId = productId;
        
        document.getElementById('productModalTitle').textContent = product.name;
        document.getElementById('productModalBody').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                         class="img-fluid rounded" 
                         alt="${product.name}">
                </div>
                <div class="col-md-6">
                    <h4>${product.name}</h4>
                    <p class="text-muted">$${parseFloat(product.price).toFixed(2)}</p>
                    <p>${product.description || 'No description available.'}</p>
                    <p><strong>Stock:</strong> ${product.stock_quantity > 0 ? product.stock_quantity + ' available' : 'Out of stock'}</p>
                    ${product.stock_quantity > 0 ? 
                        '<div class="alert alert-success">In Stock</div>' : 
                        '<div class="alert alert-warning">Out of Stock</div>'
                    }
                </div>
            </div>
        `;
        
        // Enable/disable add to cart button based on stock
        const addToCartBtn = document.getElementById('modal-add-to-cart');
        if (product.stock_quantity > 0) {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.classList.remove('btn-secondary');
            addToCartBtn.classList.add('btn-primary');
        } else {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.classList.remove('btn-primary');
            addToCartBtn.classList.add('btn-secondary');
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading product details:', error);
        alert('Error loading product details');
    }
}

// Filter products based on search and price
function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const priceFilter = document.getElementById('price-filter').value;
    
    let filteredProducts = allProducts;
    
    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply price filter
    if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-').map(Number);
        filteredProducts = filteredProducts.filter(product => {
            const price = parseFloat(product.price);
            return price >= min && (max === 999 ? true : price <= max);
        });
    }
    
    displayProducts(filteredProducts);
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('price-filter').value = 'all';
    displayProducts(allProducts);
}

// Show/hide loading spinner
function showLoading(show) {
    document.getElementById('loading-spinner').style.display = show ? 'block' : 'none';
}

// Show/hide no products message
function showNoProducts(show, message = 'No products found') {
    const noProductsDiv = document.getElementById('no-products');
    noProductsDiv.style.display = show ? 'block' : 'none';
    if (show && message) {
        noProductsDiv.querySelector('h3').textContent = message;
    }
}

// Enhanced add to cart function
// Enhanced add to cart function
function addToCart(productId) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html?redirect=products';
        return;
    }
    
    // Get user-specific cart
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const cartKey = user.id ? `cart_${user.id}` : 'cart_guest';
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
        // Increase quantity if already in cart
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            productId: productId,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save back to user-specific localStorage
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
    
    // Show success message
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        alert(`Added ${product.name} to cart!`);
    } else {
        alert('Product added to cart!');
    }
}

// Update cart count in navbar
function updateCartCount() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const cartKey = user.id ? `cart_${user.id}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// // Update cart count in navbar
// function updateCartCount() {
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];
//     const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
//     document.getElementById('cart-count').textContent = totalItems;
// }

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
    
    // Add event listener for modal add to cart button
    document.getElementById('modal-add-to-cart').addEventListener('click', function() {
        if (currentProductId) {
            addToCart(currentProductId);
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            modal.hide();
        }
    });
    
    // Add logout event listener
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});