// Global variables
let currentEmail = '';
let countdownTimer;
let timeLeft = 60; // 60 seconds timer

// Helper function to show messages
function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
}

// Safe storage wrapper
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

// Start countdown timer
function startTimer() {
    timeLeft = 60; // Reset to 60 seconds
    const timerDisplay = document.getElementById('countdown-timer');
    const resendTimer = document.getElementById('resend-timer');
    const resendBtn = document.getElementById('resend-btn');
    const timerContainer = document.getElementById('timer-container');
    const otpExpired = document.getElementById('otp-expired');
    
    // Show timer, hide expired message
    timerContainer.style.display = 'block';
    otpExpired.style.display = 'none';
    
    // Disable resend button initially
    resendBtn.disabled = true;
    
    // Clear any existing timer
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
    
    countdownTimer = setInterval(() => {
        timeLeft--;
        
        // Update both timer displays
        timerDisplay.textContent = timeLeft;
        resendTimer.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            // Show expired message
            timerContainer.style.display = 'none';
            otpExpired.style.display = 'block';
            // Enable resend button
            resendBtn.disabled = false;
            resendTimer.textContent = '0';
        }
    }, 1000);
}

// Handle register form
document.getElementById('register-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageDiv = document.getElementById('register-message');
    
    // Clear previous messages
    if (messageDiv) messageDiv.style.display = 'none';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        if (messageDiv) showMessage(messageDiv, 'Passwords do not match!', 'danger');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        if (messageDiv) showMessage(messageDiv, 'Password must be at least 6 characters long.', 'danger');
        return;
    }
    
    try {
        const response = await axios.post('/api/auth/register', {
            name,
            email,
            password
        });
        
        // Store email for OTP verification
        currentEmail = email;
        
        if (response.data.requiresVerification) {
            // Show OTP verification form and start timer
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('otp-verification').style.display = 'block';
            startTimer();
            
            if (messageDiv) showMessage(messageDiv, response.data.message, 'success');
        } else {
            // Direct login (for backward compatibility)
            safeStorage.setItem('token', response.data.token);
            safeStorage.setItem('user', JSON.stringify(response.data.user));
            if (messageDiv) showMessage(messageDiv, 'Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
        
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        if (messageDiv) showMessage(messageDiv, errorMessage, 'danger');
    }
});

// Verify OTP
async function verifyOTP() {
    const otpCode = document.getElementById('otp-code').value;
    const messageDiv = document.getElementById('register-message');
    
    if (!otpCode || otpCode.length !== 6) {
        if (messageDiv) showMessage(messageDiv, 'Please enter a valid 6-digit OTP code.', 'warning');
        return;
    }
    
    // Check if OTP is expired
    if (timeLeft <= 0) {
        if (messageDiv) showMessage(messageDiv, 'OTP has expired. Please request a new one.', 'danger');
        return;
    }
    
    try {
        const response = await axios.post('/api/auth/verify-email', {
            email: currentEmail,
            token: otpCode
        });
        
        // Clear the timer
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }
        
        // Store token and user data
        safeStorage.setItem('token', response.data.token);
        safeStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (messageDiv) showMessage(messageDiv, '✅ ' + response.data.message + ' Redirecting to home page...', 'success');
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
        if (messageDiv) showMessage(messageDiv, errorMessage, 'danger');
    }
}

// Resend OTP
async function resendOTP() {
    const messageDiv = document.getElementById('register-message');
    const resendBtn = document.getElementById('resend-btn');
    
    // Disable resend button immediately
    resendBtn.disabled = true;
    
    try {
        const response = await axios.post('/api/auth/resend-verification', {
            email: currentEmail
        });
        
        // Start the timer again
        startTimer();
        
        if (messageDiv) showMessage(messageDiv, '✅ ' + response.data.message, 'success');
        
        // Clear OTP input field
        document.getElementById('otp-code').value = '';
        
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
        if (messageDiv) showMessage(messageDiv, errorMessage, 'danger');
        // Re-enable resend button on error
        resendBtn.disabled = false;
    }
}

// Cancel verification
function cancelVerification() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('otp-verification').style.display = 'none';
    document.getElementById('register-message').style.display = 'none';
    document.getElementById('otp-code').value = '';
    currentEmail = '';
    
    // Clear the timer
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
}

// Handle login form
document.getElementById('login-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('login-message');
    
    // Clear previous messages
    if (messageDiv) messageDiv.style.display = 'none';
    
    try {
        const response = await axios.post('/api/auth/login', {
            email,
            password
        });
        
        // Store token and user data
        safeStorage.setItem('token', response.data.token);
        safeStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Show success message
        if (messageDiv) showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
        
        // Redirect to home page after short delay
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            window.location.href = redirect || 'index.html';
        }, 1500);
        
    } catch (error) {
        const errorData = error.response?.data;
        
        if (errorData?.requiresVerification) {
            // Redirect to verification page
            if (messageDiv) showMessage(messageDiv, errorData.message, 'warning');
            setTimeout(() => {
                window.location.href = `verify-email.html?email=${encodeURIComponent(errorData.email)}`;
            }, 2000);
        } else {
            const errorMessage = errorData?.message || 'Login failed. Please try again.';
            if (messageDiv) showMessage(messageDiv, errorMessage, 'danger');
        }
    }
});

// Auto-fill email if coming from checkout
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    if (redirect === 'checkout') {
        const messageDiv = document.getElementById('login-message');
        if (messageDiv) {
            showMessage(messageDiv, 'Please login to complete your purchase.', 'info');
        }
    }
});