// assets/js/auth.js - Complete Authentication System (Firebase Only) - නිවැරදි කළ
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
            created_at: localStorage.getItem('user_created_at') || new Date().toISOString()
        };
        return true;
    }
    currentUser = null;
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
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return false;
    }
    
    if (!isAdmin()) {
        document.getElementById('accessDenied').style.display = 'block';
        return false;
    }
    
    return true;
}

// Login function - Firebase Only
async function login(email, password) {
    console.log('🔐 Firebase login attempt:', email);
    
    // Show loading state
    const submitBtn = document.getElementById('loginSubmit') || document.getElementById('registerSubmit');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Logging in...';

    const user = await clientDB.verifyUser(email, password);

    // Revert loading state
    submitBtn.disabled = false;
    submitBtn.innerText = originalText;
    
    if (user) {
        // Save user data to localStorage
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_name', user.full_name);
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_created_at', user.created_at);

        // Update global user object
        currentUser = user;

        console.log('✅ Login successful. Redirecting...');
        
        // Redirect logic
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        window.location.href = redirect;
        return true;
    } else {
        alert('Login Failed: Invalid email or password.');
        return false;
    }
}

// Registration function - Firebase Only
async function register(fullName, email, password) {
    console.log('📝 Firebase registration attempt:', email);

    // Simple validation (can be more robust)
    if (!fullName || !email || !password) {
        alert('Please fill in all fields.');
        return false;
    }

    // Show loading state
    const submitBtn = document.getElementById('registerSubmit');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Registering...';

    const newUser = await clientDB.registerUser(fullName, email, password);

    // Revert loading state
    submitBtn.disabled = false;
    submitBtn.innerText = originalText;

    if (newUser) {
        alert('Registration successful! Please login.');
        document.querySelector('.tab-btn').click(); // Switch to login tab
        return true;
    } else {
        alert('Registration Failed. Email might be already in use or a database error occurred.');
        return false;
    }
}

// Logout function
function logout() {
    console.log('🚪 Logging out...');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_created_at');
    currentUser = null;
    alert('You have been logged out.');
    window.location.href = 'index.html';
}

// Auto-login for demo (only on login.html)
function autoLoginDemo() {
    // If user is already logged in, redirect them to dashboard
    if (isLoggedIn()) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        console.log('✅ Already logged in, redirecting to:', redirect);
        window.location.href = redirect;
    }

    // Add submit handlers to forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            register(fullName, email, password);
        });
    }
}

// Update navigation bar based on auth status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.querySelector('.logout-btn');
    const userWelcome = document.getElementById('userWelcome');
    const adminLink = document.getElementById('adminLink');
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        
        if (loginLink) {
            loginLink.style.display = 'none';
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
        
        if (userWelcome) {
            userWelcome.textContent = `Hello, ${user.full_name.split(' ')[0]}!`;
            userWelcome.style.display = 'inline-block';
        }
        
        if (adminLink) {
            if (isAdmin()) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }
        
        console.log('✅ Navigation updated for logged-in user');
    } else {
        if (loginLink) {
            loginLink.style.display = 'inline-block';
        }
        
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        
        if (userWelcome) {
            userWelcome.style.display = 'none';
        }
        
        if (adminLink) {
            adminLink.style.display = 'none';
        }

        console.log('✅ Navigation updated for guest user');
    }
}

// Initialize auth system when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth system initializing...');
    
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        updateNavigation();
        
        // Debug info
        if (isLoggedIn()) {
            console.log('✅ User is logged in:', getCurrentUser());
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
    console.log('Firebase Initialized:', clientDB.initialized);
    console.log('LocalStorage:', {
        user_id: localStorage.getItem('user_id'),
        user_email: localStorage.getItem('user_email'),
        user_name: localStorage.getItem('user_name'),
        user_role: localStorage.getItem('user_role'),
        user_created_at: localStorage.getItem('user_created_at')
    });
}

// Call auto-login on login page
if (window.location.href.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', autoLoginDemo);
}

// Export for other scripts to use (optional)
window.login = login;
window.logout = logout;
window.register = register;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;
window.requireAdmin = requireAdmin;
window.updateNavigation = updateNavigation;