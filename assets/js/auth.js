// assets/js/auth.js - Complete Authentication System

// Check if user is logged in
function isLoggedIn() {
    const loggedIn = localStorage.getItem('user_id') !== null;
    console.log('isLoggedIn check:', loggedIn, 'User ID:', localStorage.getItem('user_id'));
    return loggedIn;
}

// Get current user
function getCurrentUser() {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        console.log('No user ID found in localStorage');
        return null;
    }

    console.log('Getting current user with ID:', userId);
    
    // For immediate response, we'll create a basic user object from localStorage
    // The full user data will be loaded from database when needed
    const user = {
        id: parseInt(userId),
        email: localStorage.getItem('user_email') || '',
        full_name: localStorage.getItem('user_name') || '',
        role: localStorage.getItem('user_role') || 'user',
        created_at: localStorage.getItem('user_created_at') || new Date().toISOString()
    };
    
    return user;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    const admin = user && user.role === 'admin';
    console.log('isAdmin check:', admin, 'User role:', user?.role);
    return admin;
}

// Login function - FIXED VERSION
async function login(email, password) {
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
        return { success: false, message: 'Please fill in all fields' };
    }
    
    try {
        const user = await clientDB.verifyUser(email, password);
        
        if (user) {
            // Store user session in localStorage
            localStorage.setItem('user_id', user.id.toString());
            localStorage.setItem('user_email', user.email);
            localStorage.setItem('user_name', user.full_name || user.email.split('@')[0]);
            localStorage.setItem('user_role', user.role || 'user');
            localStorage.setItem('user_created_at', user.created_at);
            
            console.log('Login successful for user:', user.email);
            console.log('Stored user data:', {
                id: localStorage.getItem('user_id'),
                email: localStorage.getItem('user_email'),
                name: localStorage.getItem('user_name'),
                role: localStorage.getItem('user_role')
            });
            
            return {
                success: true,
                message: 'Login successful!',
                user: user
            };
        } else {
            console.log('Login failed - invalid credentials for:', email);
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Login failed. Please try again.'
        };
    }
}

// Register function - FIXED VERSION
async function register(email, password, fullName = '') {
    console.log('Registration attempt for:', email);
    
    if (!email || !password) {
        return { success: false, message: 'Please fill in all required fields' };
    }
    
    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
    }
    
    try {
        const user = await clientDB.createUser(email, password, fullName);
        
        if (user) {
            console.log('Registration successful for user:', user.email);
            return {
                success: true,
                message: 'Registration successful! You can now login.',
                user: user
            };
        } else {
            console.log('Registration failed - user already exists:', email);
            return {
                success: false,
                message: 'User already exists with this email'
            };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'Registration failed. Please try again.'
        };
    }
}

// Logout function
function logout() {
    console.log('Logging out user:', localStorage.getItem('user_email'));
    
    // Clear all user data from localStorage
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_created_at');
    
    console.log('Logout successful, redirecting to login page');
    window.location.href = 'login.html';
}

// Update navigation based on login status
function updateNavigation() {
    const loginBtn = document.getElementById('loginLink');
    const logoutBtn = document.querySelector('.logout-btn');
    const userWelcome = document.getElementById('userWelcome');
    const adminLink = document.getElementById('adminLink');
    
    console.log('Updating navigation, isLoggedIn:', isLoggedIn());
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        console.log('User logged in:', user);
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${user.full_name || user.email.split('@')[0]}`;
            userWelcome.style.display = 'inline-block';
        }
        // Show admin link only for admin users
        if (adminLink) {
            adminLink.style.display = isAdmin() ? 'inline-block' : 'none';
            console.log('Admin link display:', adminLink.style.display);
        }
    } else {
        console.log('User not logged in, showing login button');
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userWelcome) userWelcome.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Protect pages that require login
function requireAuth() {
    if (!isLoggedIn()) {
        console.log('Authentication required - redirecting to login');
        alert('Please login to access this page.');
        window.location.href = 'login.html';
        return false;
    }
    console.log('Authentication successful');
    return true;
}

// Protect admin pages
function requireAdmin() {
    if (!requireAuth()) {
        return false;
    }
    
    if (!isAdmin()) {
        console.log('Admin access denied for user:', getCurrentUser()?.email);
        alert('Access denied. Admin privileges required.');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    console.log('Admin access granted');
    return true;
}

// Delete user account (admin only)
async function deleteUserAccount(userId) {
    if (!requireAdmin()) return false;
    
    // Prevent self-deletion
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        alert('You cannot delete your own account!');
        return false;
    }
    
    if (confirm('Are you sure you want to delete this user account? This action cannot be undone!')) {
        const success = await clientDB.deleteUser(userId);
        if (success) {
            alert('User account deleted successfully!');
            return true;
        } else {
            alert('Failed to delete user account.');
            return false;
        }
    }
    return false;
}

// Download user accounts (admin only)
async function downloadUserAccounts() {
    if (!requireAdmin()) return;
    await clientDB.downloadUserAccounts();
}

// Get user statistics
async function getUserStats() {
    try {
        const users = await clientDB.getUsers();
        const logs = await clientDB.getUserLogs();
        
        return {
            totalUsers: users.length,
            totalLogs: logs.length,
            lastRegistration: logs.length > 0 ? new Date(logs[logs.length - 1].logged_at) : null
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        return {
            totalUsers: 0,
            totalLogs: 0,
            lastRegistration: null
        };
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system initializing...');
    updateNavigation();
});

// Debug function to check authentication state
function debugAuth() {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('isLoggedIn:', isLoggedIn());
    console.log('Current User:', getCurrentUser());
    console.log('isAdmin:', isAdmin());
    console.log('LocalStorage:', {
        user_id: localStorage.getItem('user_id'),
        user_email: localStorage.getItem('user_email'),
        user_name: localStorage.getItem('user_name'),
        user_role: localStorage.getItem('user_role')
    });
    console.log('=====================');
}