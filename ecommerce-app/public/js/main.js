// Safe localStorage wrapper that handles browser restrictions
const safeStorage = {
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn('localStorage blocked, using sessionStorage');
            try {
                sessionStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('Both storage methods blocked');
                return false;
            }
        }
    },
    
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            try {
                return sessionStorage.getItem(key);
            } catch (e) {
                return null;
            }
        }
    },
    
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            // ignore
        }
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            // ignore
        }
    }
};

// Global variables
let currentUser = null;

// Check if user is logged in and update UI
function checkAuth() {
    const token = safeStorage.getItem('token');
    const userData = safeStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            updateAuthUI(true);
            // Load user-specific cart when user logs in
            loadUserCart();
        } catch (error) {
            console.error('Error parsing user data:', error);
            logout();
        }
    } else {
        updateAuthUI(false);
        // Clear cart when no user is logged in
        clearCart();
    }
    updateCartCount();
}

// Update UI based on authentication status
function updateAuthUI(isLoggedIn) {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const adminLink = document.getElementById('admin-link');
    
    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'block';
    if (logoutLink) logoutLink.style.display = isLoggedIn ? 'block' : 'none';
    
    // Show admin link only for admin users
    if (adminLink && currentUser && currentUser.role === 'admin') {
        adminLink.style.display = 'block';
    } else if (adminLink) {
        adminLink.style.display = 'none';
    }
}

// Get user-specific cart key
function getCartKey() {
    if (currentUser && currentUser.id) {
        return `cart_${currentUser.id}`;
    }
    return 'cart_guest'; // For non-logged in users
}

// Load user-specific cart
function loadUserCart() {
    const cartKey = getCartKey();
    const cart = JSON.parse(safeStorage.getItem(cartKey)) || [];
    return cart;
}

// Save user-specific cart
function saveUserCart(cart) {
    const cartKey = getCartKey();
    safeStorage.setItem(cartKey, JSON.stringify(cart));
}

// Clear current cart
function clearCart() {
    const cartKey = getCartKey();
    safeStorage.removeItem(cartKey);
}

// Update cart count in navbar
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = loadUserCart();
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
}

// Load featured products on homepage
async function loadFeaturedProducts() {
    try {
        const response = await axios.get('/api/products');
        const products = response.data.slice(0, 3); // Get first 3 products
        
        const container = document.getElementById('featured-products');
        if (container) {
            container.innerHTML = products.map(product => `
                <div class="col-md-4 mb-4">
                    <div class="card product-card">
                        <img src="${product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                             class="card-img-top" 
                             alt="${product.name}"
                             style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">$${parseFloat(product.price).toFixed(2)}</p>
                            <button onclick="addToCart(${product.id})" class="btn btn-primary">Add to Cart</button>
                            <a href="products.html" class="btn btn-outline-secondary">View All</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Add to cart function
function addToCart(productId) {
    // Check if user is logged in
    const token = safeStorage.getItem('token');
    if (!token) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html?redirect=products';
        return;
    }
    
    // Get current user's cart
    let cart = loadUserCart();
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            productId: productId,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save back to user-specific cart
    saveUserCart(cart);
    updateCartCount();
    
    // Show success message
    alert('Product added to cart!');
}

// Logout function
function logout() {
    // Clear all user data but keep user-specific cart for potential future login
    safeStorage.removeItem('token');
    safeStorage.removeItem('user');
    currentUser = null;
    
    // Switch to guest cart
    updateCartCount();
    
    window.location.href = 'index.html';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Load featured products if on homepage
    if (document.getElementById('featured-products')) {
        loadFeaturedProducts();
    }
    
    // Add logout event listener
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});