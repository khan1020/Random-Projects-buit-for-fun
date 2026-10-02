let cartItems = [];
let products = [];

// Get user-specific cart key
function getCartKey() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
        return `cart_${user.id}`;
    }
    return 'cart_guest';
}

// Load cart items
async function loadCart() {
    // Get cart from user-specific localStorage
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    try {
        // Fetch product details for all items in cart
        const productIds = [...new Set(cart.map(item => item.productId))];
        const productPromises = productIds.map(id => 
            axios.get(`/api/products/${id}`)
        );
        
        const productResponses = await Promise.all(productPromises);
        products = productResponses.map(response => response.data);
        
        // Group cart items by product and count quantities
        const itemCounts = {};
        cart.forEach(item => {
            if (!itemCounts[item.productId]) {
                itemCounts[item.productId] = 0;
            }
            itemCounts[item.productId] += (item.quantity || 1);
        });
        
        // Create cart items with quantities
        cartItems = Object.keys(itemCounts).map(productId => {
            const product = products.find(p => p.id == productId);
            return {
                product: product,
                quantity: itemCounts[productId]
            };
        });
        
        displayCartItems();
        calculateTotals();
        showCartContent();
        
    } catch (error) {
        console.error('Error loading cart:', error);
        alert('Error loading cart items');
    }
}

// Display cart items
function displayCartItems() {
    const container = document.getElementById('cart-items');
    
    container.innerHTML = cartItems.map(item => `
        <div class="cart-item row align-items-center mb-3 pb-3 border-bottom">
            <div class="col-md-2">
                <img src="${item.product.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}" 
                     class="img-fluid rounded" 
                     alt="${item.product.name}"
                     style="height: 80px; object-fit: cover;">
            </div>
            <div class="col-md-4">
                <h6 class="mb-1">${item.product.name}</h6>
                <p class="text-muted mb-0">$${parseFloat(item.product.price).toFixed(2)}</p>
            </div>
            <div class="col-md-3">
                <div class="input-group input-group-sm">
                    <button class="btn btn-outline-secondary" type="button" 
                            onclick="updateQuantity(${item.product.id}, -1)">-</button>
                    <input type="number" class="form-control text-center" 
                           value="${item.quantity}" 
                           min="1" 
                           onchange="updateQuantity(${item.product.id}, 0, this.value)">
                    <button class="btn btn-outline-secondary" type="button" 
                            onclick="updateQuantity(${item.product.id}, 1)">+</button>
                </div>
            </div>
            <div class="col-md-2">
                <strong>$${(item.product.price * item.quantity).toFixed(2)}</strong>
            </div>
            <div class="col-md-1">
                <button class="btn btn-danger btn-sm" 
                        onclick="removeFromCart(${item.product.id})">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Update item quantity
function updateQuantity(productId, change, newValue = null) {
    const cartKey = getCartKey();
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    if (newValue !== null) {
        // Set specific quantity
        const quantity = parseInt(newValue);
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        // Remove all instances and add the specified quantity
        cart = cart.filter(item => item.productId !== productId);
        for (let i = 0; i < quantity; i++) {
            cart.push({ 
                productId: productId,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
    } else {
        // Add or remove one
        if (change > 0) {
            cart.push({ 
                productId: productId,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        } else if (change < 0) {
            const index = cart.findIndex(item => item.productId === productId);
            if (index > -1) {
                cart.splice(index, 1);
            }
        }
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    loadCart(); // Reload the cart
    updateCartCount();
}

// Remove item from cart
function removeFromCart(productId) {
    const cartKey = getCartKey();
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    cart = cart.filter(item => item.productId !== productId);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    loadCart(); // Reload the cart
    updateCartCount();
}

// Calculate totals
function calculateTotals() {
    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
    
    const shipping = 5.00; // Fixed shipping
    const tax = subtotal * 0.08; // 8% tax
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${(subtotal + shipping + tax).toFixed(2)}`;
}

// Show/hide empty cart message
function showEmptyCart() {
    document.getElementById('empty-cart').style.display = 'block';
    document.getElementById('cart-content').style.display = 'none';
}

function showCartContent() {
    document.getElementById('empty-cart').style.display = 'none';
    document.getElementById('cart-content').style.display = 'block';
}

// Update cart count in navbar
function updateCartCount() {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Checkout function
document.getElementById('checkout-btn').addEventListener('click', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to proceed with checkout');
        window.location.href = 'login.html?redirect=checkout';
        return;
    }
    
    // Check if cart has items
    if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCart();
    
    // Add logout event listener
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});