// Success page functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    displayOrderDetails();
    
    // Clear cart on success page load (since order is completed)
    localStorage.removeItem('cart');
    updateCartCount();
    
    // Add logout event listener
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});

function displayOrderDetails() {
    // In a real app, you'd get this from the backend or URL parameters
    // For now, we'll generate random order details
    const orderId = 'ORD' + Math.floor(10000 + Math.random() * 90000);
    const total = localStorage.getItem('lastOrderTotal') || '0.00';
    
    document.getElementById('order-id').textContent = `#${orderId}`;
    document.getElementById('order-total').textContent = `$${parseFloat(total).toFixed(2)}`;
    
    // Clear the last order total
    localStorage.removeItem('lastOrderTotal');
}