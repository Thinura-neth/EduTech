// assets/js/auth.js - Complete Authentication System with Coins Support
let currentUser = null;

// Check if user is logged in
function isLoggedIn() {
    const userId = localStorage.getItem('user_id');
    const userEmail = localStorage.getItem('user_email');
    
    if (userId && userEmail) {
        currentUser = {
            id: userId,
            email: userEmail,
            full_name: localStorage.getItem('user_name') || userEmail.split('@')[0],
            role: localStorage.getItem('user_role') || 'user',
            created_at: localStorage.getItem('user_created_at') || new Date().toISOString(),
            coins: parseInt(localStorage.getItem('user_coins') || '0')
        };
        return true;
    }
    return false;
}

// Get current user
function getCurrentUser() {
    if (!currentUser) {
        isLoggedIn(); // Refresh current user data
    }
    return currentUser;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Require admin access
function requireAdmin() {
    if (!isLoggedIn()) {
        alert('Please login to access this feature.');
        window.location.href = 'login.html';
        return false;
    }
    
    if (!isAdmin()) {
        alert('Admin privileges required.');
        return false;
    }
    
    return true;
}

// Login function - Firebase Only
async function loginUser(email, password) {
    console.log('🔐 Firebase login attempt:', email);
    
    // Show loading state
    const submitBtn = document.getElementById('loginSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing In...';
    }

    try {
        // Verify user with Firebase
        const user = await clientDB.verifyUser(email, password);
        
        if (user) {
            console.log('✅ Login successful:', email);
            
            // Initialize coins for user if not exists
            await clientDB.initializeUserCoins(user.id);
            
            // Get updated user data with coins
            const userWithCoins = await clientDB.getUser(user.id);
            
            // Store user data in localStorage
            localStorage.setItem('user_id', userWithCoins.id);
            localStorage.setItem('user_email', userWithCoins.email);
            localStorage.setItem('user_name', userWithCoins.full_name || userWithCoins.email.split('@')[0]);
            localStorage.setItem('user_role', userWithCoins.role || 'user');
            localStorage.setItem('user_created_at', userWithCoins.created_at || new Date().toISOString());
            localStorage.setItem('user_coins', userWithCoins.coins || '0');
            
            currentUser = userWithCoins;
            
            // Update login info in database
            await clientDB.updateUser(user.id, {
                last_login: new Date().toISOString(),
                login_count: (user.login_count || 0) + 1
            });

            // Log the login action
            await clientDB.logAction(user, 'LOGIN', 'User logged in successfully');

            return {
                success: true,
                message: 'Login successful! Redirecting...',
                user: userWithCoins
            };
        } else {
            console.log('❌ Login failed - invalid credentials');
            return {
                success: false,
                message: 'Invalid email or password. Please try again.'
            };
        }
        
    } catch (error) {
        console.error('🔥 Login error:', error);
        return {
            success: false,
            message: 'Login failed. Please check your connection and try again.'
        };
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }
}

// Register function - Firebase Only
async function registerUser(email, password, fullName = '') {
    console.log('📝 Firebase registration attempt:', email);
    
    // Show loading state
    const submitBtn = document.getElementById('registerSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
    }

    try {
        // Create user with Firebase
        const user = await clientDB.createUser(email, password, fullName);
        
        if (user) {
            console.log('✅ Registration successful:', email);
            
            // Initialize coins for new user
            await clientDB.initializeUserCoins(user.id);
            
            // Get user data with coins
            const userWithCoins = await clientDB.getUser(user.id);
            
            // Store user data in localStorage and auto-login
            localStorage.setItem('user_id', userWithCoins.id);
            localStorage.setItem('user_email', userWithCoins.email);
            localStorage.setItem('user_name', userWithCoins.full_name);
            localStorage.setItem('user_role', userWithCoins.role);
            localStorage.setItem('user_created_at', userWithCoins.created_at);
            localStorage.setItem('user_coins', userWithCoins.coins || '0');
            
            currentUser = userWithCoins;

            return {
                success: true,
                message: 'Registration successful! You are now logged in.',
                user: userWithCoins
            };
        } else {
            console.log('❌ Registration failed - user might already exist');
            return {
                success: false,
                message: 'Registration failed. This email might already be registered.'
            };
        }
        
    } catch (error) {
        console.error('🔥 Registration error:', error);
        return {
            success: false,
            message: 'Registration failed. Please try again.'
        };
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    }
}

// Logout function
function logout() {
    const user = getCurrentUser();
    console.log('🚪 Logging out user:', user?.email);
    
    // Log the logout action
    if (user) {
        clientDB.logAction(user, 'LOGOUT', 'User logged out');
    }
    
    // Clear localStorage
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_created_at');
    localStorage.removeItem('user_coins');
    
    currentUser = null;
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const userWelcome = document.getElementById('userWelcome');
    const logoutBtn = document.querySelector('.logout-btn');
    const adminLink = document.getElementById('adminLink');
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        const userName = user.full_name || user.email.split('@')[0];
        
        // Show user welcome and logout button
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${userName}`;
            userWelcome.style.display = 'inline';
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
        
        // Hide login link
        if (loginLink) {
            loginLink.style.display = 'none';
        }
        
        // Show admin link if user is admin
        if (adminLink && user.role === 'admin') {
            adminLink.style.display = 'inline';
        }

        console.log('✅ Navigation updated for logged in user:', userName);
    } else {
        // Show login link, hide user info
        if (loginLink) {
            loginLink.style.display = 'inline';
        }
        
        if (userWelcome) {
            userWelcome.style.display = 'none';
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        
        if (adminLink) {
            adminLink.style.display = 'none';
        }

        console.log('✅ Navigation updated for guest user');
    }
}

// Update user coins in localStorage
function updateUserCoinsLocal(coins) {
    const user = getCurrentUser();
    if (user) {
        user.coins = coins;
        localStorage.setItem('user_coins', coins.toString());
    }
}

// Get user coins with fallback
async function getUserCoins(userId) {
    try {
        // Try Firebase first
        const coins = await clientDB.getUserCoins(userId);
        updateUserCoinsLocal(coins);
        return coins;
    } catch (error) {
        console.error('Error getting coins from Firebase, using localStorage:', error);
        // Fallback to localStorage
        return parseInt(localStorage.getItem('user_coins') || '0');
    }
}

// Add coins with fallback
async function addUserCoins(userId, amount, reason = 'Bonus') {
    try {
        // Try Firebase first
        const success = await clientDB.addCoins(userId, amount, reason);
        if (success) {
            const newCoins = await getUserCoins(userId);
            updateUserCoinsLocal(newCoins);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error adding coins via Firebase, using localStorage:', error);
        // Fallback to localStorage
        return addCoinsLocalStorage(userId, amount, reason);
    }
}

// Local Storage fallback for coins
function addCoinsLocalStorage(userId, amount, reason = 'Bonus') {
    try {
        const key = `edutech_coins_${userId}`;
        const historyKey = `edutech_coins_history_${userId}`;
        
        // Get current coins
        const currentCoins = parseInt(localStorage.getItem(key) || localStorage.getItem('user_coins') || '0');
        const newCoins = currentCoins + amount;
        
        // Update coins
        localStorage.setItem(key, newCoins.toString());
        localStorage.setItem('user_coins', newCoins.toString());
        
        // Update current user
        if (currentUser) {
            currentUser.coins = newCoins;
        }
        
        // Add to history
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        history.unshift({
            amount: amount,
            reason: reason,
            timestamp: Date.now(),
            new_balance: newCoins
        });
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem(historyKey, JSON.stringify(history));
        
        console.log(`✅ Added ${amount} coins via localStorage. New balance: ${newCoins}`);
        return true;
    } catch (error) {
        console.error('Error with localStorage coins:', error);
        return false;
    }
}

// Initialize auth system when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth system initializing...');
    
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        updateNavigation();
        
        // Update coins balance if user is logged in
        if (isLoggedIn()) {
            const user = getCurrentUser();
            getUserCoins(user.id).then(coins => {
                console.log('💰 User coins balance:', coins);
            });
            
            console.log('✅ User is logged in:', user);
        } else {
            console.log('❌ No user logged in');
            console.log('💡 Demo credentials: admin@example.com / password123');
        }
    }, 1000);
});

// Debug function to check auth status
function debugAuth() {
    console.log('=== AUTH DEBUG ===');
    console.log('Current User:', getCurrentUser());
    console.log('Is Logged In:', isLoggedIn());
    console.log('Is Admin:', isAdmin());
    console.log('User Coins:', getCurrentUser()?.coins || 0);
    console.log('Firebase Initialized:', typeof clientDB !== 'undefined' && clientDB.initialized);
    console.log('LocalStorage:', {
        user_id: localStorage.getItem('user_id'),
        user_email: localStorage.getItem('user_email'),
        user_name: localStorage.getItem('user_name'),
        user_role: localStorage.getItem('user_role'),
        user_created_at: localStorage.getItem('user_created_at'),
        user_coins: localStorage.getItem('user_coins')
    });
}


// Export functions for global use
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;
window.requireAdmin = requireAdmin;
window.updateNavigation = updateNavigation;
window.debugAuth = debugAuth;
window.addUserCoins = addUserCoins;
window.getUserCoins = getUserCoins;

// Call auto-login on login page
if (window.location.href.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', autoLoginDemo);
}
