// Safe localStorage wrapper that handles browser restrictions
const safeStorage = {
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.warn('localStorage setItem failed:', error);
            // Fallback: use sessionStorage or in-memory storage
            try {
                sessionStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('sessionStorage also failed, using in-memory storage');
                safeStorage.memoryStorage[key] = value;
                return true;
            }
        }
    },
    
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('localStorage getItem failed:', error);
            try {
                return sessionStorage.getItem(key);
            } catch (e) {
                return safeStorage.memoryStorage[key] || null;
            }
        }
    },
    
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('localStorage removeItem failed:', error);
        }
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            // ignore
        }
        delete safeStorage.memoryStorage[key];
    },
    
    memoryStorage: {}
};