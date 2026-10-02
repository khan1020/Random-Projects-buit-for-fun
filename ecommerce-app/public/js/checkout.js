// Stripe and cart variables
let stripe;
let elements;
let cartItems = [];
let clientSecret;
let isStripeInitialized = false;

// Get user-specific cart key
function getCartKey() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id ? `cart_${user.id}` : 'cart_guest';
}

// Initialize checkout
async function initializeCheckout() {
    console.log('🔄 Initializing checkout...');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to proceed with checkout');
        window.location.href = 'login.html';
        return;
    }

    // Check if cart has items
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }

    await loadCartItems();
    await initializeStripe();
    setupEventListeners();
}

// Load cart items for checkout
async function loadCartItems() {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    try {
        console.log('📦 Loading cart items...', cart);
        
        // Fetch product details
        const productIds = [...new Set(cart.map(item => item.productId))];
        const productPromises = productIds.map(id => 
            axios.get(`/api/products/${id}`)
        );
        
        const productResponses = await Promise.all(productPromises);
        const products = productResponses.map(response => response.data);
        
        // Group cart items by product
        const itemCounts = {};
        cart.forEach(item => {
            if (!itemCounts[item.productId]) {
                itemCounts[item.productId] = 0;
            }
            itemCounts[item.productId] += (item.quantity || 1);
        });
        
        cartItems = Object.keys(itemCounts).map(productId => {
            const product = products.find(p => p.id == productId);
            return {
                product: product,
                quantity: itemCounts[productId]
            };
        });
        
        console.log('✅ Cart items loaded:', cartItems);
        displayCheckoutItems();
        calculateCheckoutTotals();
        showCheckoutContent();
        
    } catch (error) {
        console.error('❌ Error loading checkout items:', error);
        showPaymentMessage('Error loading checkout items. Please try again.', 'danger');
    }
}

// Display checkout items
function displayCheckoutItems() {
    const container = document.getElementById('checkout-items');
    
    if (cartItems.length === 0) {
        container.innerHTML = '<p class="text-muted">No items in cart</p>';
        return;
    }
    
    container.innerHTML = cartItems.map(item => `
        <div class="row align-items-center mb-2 border-bottom pb-2">
            <div class="col-2">
                <img src="${item.product.image_url || 'https://via.placeholder.com/50x50?text=No+Image'}" 
                     class="img-fluid rounded" 
                     alt="${item.product.name}"
                     style="height: 50px; object-fit: cover;">
            </div>
            <div class="col-6">
                <h6 class="mb-0">${item.product.name}</h6>
                <small class="text-muted">Qty: ${item.quantity}</small>
            </div>
            <div class="col-4 text-end">
                <strong>$${(item.product.price * item.quantity).toFixed(2)}</strong>
            </div>
        </div>
    `).join('');
}

// Calculate checkout totals
function calculateCheckoutTotals() {
    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
    
    const shipping = 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('checkout-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;

    console.log('💰 Totals calculated:', { subtotal, shipping, tax, total });
    return total;
}

// Initialize Stripe
async function initializeStripe() {
    const total = calculateCheckoutTotals();
    
    if (total <= 0) {
        console.error('❌ Invalid total amount:', total);
        showPaymentMessage('Cannot process payment with zero total', 'danger');
        return;
    }

    try {
        console.log('💳 Initializing Stripe with total:', total);
        
        // Show loading spinner
        document.getElementById('loading-spinner').style.display = 'block';
        document.getElementById('checkout-content').style.display = 'none';

        // Get Stripe configuration
        console.log('🔧 Getting Stripe config...');
        const configResponse = await axios.get('/api/stripe/config');
        const stripeConfig = configResponse.data;
        console.log('✅ Stripe config:', stripeConfig);

        if (!stripeConfig.publishableKey) {
            throw new Error('No Stripe publishable key found');
        }

        // Initialize Stripe
        stripe = Stripe(stripeConfig.publishableKey);
        console.log('✅ Stripe initialized');

        // Create payment intent
        console.log('🔄 Creating payment intent...');
        const response = await axios.post('/api/stripe/create-payment-intent', {
            amount: total
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        clientSecret = response.data.clientSecret;
        console.log('✅ Payment intent created, clientSecret:', clientSecret.substring(0, 20) + '...');

        if (!clientSecret) {
            throw new Error('No client secret received from server');
        }

        // Create and mount the Payment Element
        elements = stripe.elements({
            clientSecret: clientSecret,
            appearance: {
                theme: 'stripe'
            }
        });

        const paymentElement = elements.create('payment');
        
        // Clear any existing content and mount
        const paymentElementContainer = document.getElementById('payment-element');
        paymentElementContainer.innerHTML = '';
        paymentElement.mount('#payment-element');
        
        console.log('✅ Stripe Payment Element mounted');

        // Hide loading spinner and show content
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('checkout-content').style.display = 'block';
        document.getElementById('submit-payment').disabled = false;
        
        isStripeInitialized = true;
        console.log('✅ Stripe fully initialized and ready');

    } catch (error) {
        console.error('❌ Error initializing Stripe:', error);
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('checkout-content').style.display = 'block';
        
        let errorMessage = 'Error setting up payment. ';
        if (error.response?.status === 401) {
            errorMessage += 'Please login again.';
            window.location.href = 'login.html';
        } else if (error.message.includes('publishableKey')) {
            errorMessage += 'Payment system configuration error.';
        } else {
            errorMessage += 'Please try again.';
        }
        
        showPaymentMessage(errorMessage, 'danger');
    }
}

// Setup event listeners
function setupEventListeners() {
    const submitButton = document.getElementById('submit-payment');
    const shippingForm = document.getElementById('shipping-form');

    submitButton.addEventListener('click', handlePayment);
    
    // Validate form on input
    shippingForm.addEventListener('input', validateForm);
    
    console.log('✅ Event listeners setup complete');
}

// Validate shipping form
function validateForm() {
    const form = document.getElementById('shipping-form');
    const submitButton = document.getElementById('submit-payment');
    const isValid = form.checkValidity();
    
    submitButton.disabled = !isValid || !isStripeInitialized;
    return isValid;
}

// Handle payment submission
async function handlePayment(event) {
    event.preventDefault();
    
    console.log('🔄 Payment submission started...');
    
    const submitButton = document.getElementById('submit-payment');
    const payButtonText = document.getElementById('pay-button-text');
    const payButtonSpinner = document.getElementById('pay-button-spinner');

    // Validate shipping form
    if (!validateForm()) {
        showPaymentMessage('Please fill in all required fields correctly.', 'warning');
        return;
    }

    // Check if Stripe is initialized
    if (!stripe || !elements) {
        showPaymentMessage('Payment system not ready. Please wait...', 'warning');
        return;
    }

    // Get shipping data
    const shippingData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value
    };

    console.log('📦 Shipping data:', shippingData);

    // Show loading state
    submitButton.disabled = true;
    payButtonText.textContent = 'Processing...';
    payButtonSpinner.style.display = 'inline-block';
    showPaymentMessage('Processing your payment...', 'info');

    try {
        console.log('🔐 Confirming payment with Stripe...');
        
        // Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success.html`,
                payment_method_data: {
                    billing_details: {
                        name: `${shippingData.firstName} ${shippingData.lastName}`,
                        email: shippingData.email,
                        phone: shippingData.phone,
                        address: {
                            line1: shippingData.address,
                            city: shippingData.city,
                            state: shippingData.state,
                            postal_code: shippingData.zipCode,
                            country: 'US',
                        },
                    },
                },
                shipping: {
                    name: `${shippingData.firstName} ${shippingData.lastName}`,
                    phone: shippingData.phone,
                    address: {
                        line1: shippingData.address,
                        city: shippingData.city,
                        state: shippingData.state,
                        postal_code: shippingData.zipCode,
                        country: 'US',
                    },
                },
            },
            redirect: 'if_required'
        });

        if (error) {
            console.error('❌ Stripe payment error:', error);
            showPaymentMessage(error.message, 'danger');
            resetPaymentButton();
            return;
        }

        console.log('✅ Payment successful, paymentIntent:', paymentIntent);
        
        // Payment succeeded - create order
        await createOrder(shippingData, paymentIntent.id);
        
        // Store order total for success page
        const total = calculateCheckoutTotals();
        localStorage.setItem('lastOrderTotal', total.toString());
        
        // Clear cart
        const cartKey = getCartKey();
        localStorage.removeItem(cartKey);
        updateCartCount();
        
        console.log('✅ Order created, redirecting to success page...');
        
        // Redirect to success page
        window.location.href = 'success.html';

    } catch (error) {
        console.error('❌ Payment processing error:', error);
        showPaymentMessage('An unexpected error occurred. Please try again.', 'danger');
        resetPaymentButton();
    }
}

// Create order in database
async function createOrder(shippingData, paymentIntentId) {
    try {
        const total = calculateCheckoutTotals();
        
        console.log('📝 Creating order in database...');
        
        const response = await axios.post('/api/stripe/create-order', {
            items: cartItems,
            total: total,
            shippingAddress: shippingData,
            paymentIntentId: paymentIntentId
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('✅ Order created successfully:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Error creating order:', error);
        throw error;
    }
}

// Reset payment button
function resetPaymentButton() {
    const submitButton = document.getElementById('submit-payment');
    const payButtonText = document.getElementById('pay-button-text');
    const payButtonSpinner = document.getElementById('pay-button-spinner');

    submitButton.disabled = false;
    payButtonText.textContent = 'Pay Now';
    payButtonSpinner.style.display = 'none';
}

// Show payment message
function showPaymentMessage(message, type) {
    const messageDiv = document.getElementById('payment-message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type} mt-3`;
    messageDiv.style.display = 'block';
    
    console.log(`📢 Payment message [${type}]:`, message);
}

// Show/hide checkout content
function showCheckoutContent() {
    document.getElementById('checkout-content').style.display = 'block';
    document.getElementById('empty-cart-message').style.display = 'none';
}

function showEmptyCart() {
    document.getElementById('checkout-content').style.display = 'none';
    document.getElementById('empty-cart-message').style.display = 'block';
}

// Update cart count
function updateCartCount() {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Checkout page loaded');
    checkAuth();
    updateCartCount();
    initializeCheckout();
    
    // Add logout event listener
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});