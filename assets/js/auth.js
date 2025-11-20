// assets/js/auth.js - Complete Authentication System (Firebase Auth Implemented)
let currentUser = null;

// Check if user is logged in (Local cache check)
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
        window.location.href = 'login.html';
        return false;
    }
    
    if (!isAdmin()) {
        window.location.href = 'dashboard.html?denied=true';
        return false;
    }
    
    return true;
}

// Store session data locally
function storeSession(user) {
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_email', user.email);
    localStorage.setItem('user_name', user.full_name);
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('user_created_at', user.created_at);
}

// Clear session data locally
function clearSession() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_created_at');
    currentUser = null;
}

// --- CORE AUTH FUNCTIONS (UPDATED FOR FIREBASE AUTH) ---

// Login function - NOW uses Firebase Authentication
async function login(email, password) {
    console.log('🔐 Firebase Auth login attempt:', email);
    setLoading(true);
    
    try {
        // 1. Use Firebase Auth to sign in
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const authUser = userCredential.user;
        
        // 2. Fetch extended profile data from Realtime DB
        const fullUser = await clientDB.fetchUserProfile(authUser.uid);
        
        if (!fullUser) {
            await firebase.auth().signOut();
            throw new Error("User profile missing in database. Please register again.");
        }

        // 3. Success: Redirect (Session is stored by onAuthStateChanged listener)
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('❌ Login failed:', error.message);
        // Error message cleanup for better user display
        displayError(error.message.replace('Firebase: ', '').replace(/\(.*\)/, ''));
        setLoading(false);
    }
}

// Register function - NOW uses Firebase Authentication
async function register(full_name, email, password) {
    console.log('✍️ Firebase Auth registration attempt:', email);
    setLoading(true);

    try {
        // 1. Use Firebase Auth to create user (handles secure password hashing)
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const authUser = userCredential.user;

        // 2. Save non-sensitive profile data to Realtime DB
        const newUser = await clientDB.saveUserProfile(authUser.uid, full_name, email, 'user');
        
        if (!newUser) {
            // If DB save failed, delete the auth user (cleanup)
            await authUser.delete();
            throw new Error("Failed to save user profile. Please try again.");
        }

        // 3. Success: Redirect
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        displayError(error.message.replace('Firebase: ', '').replace(/\(.*\)/, ''));
        setLoading(false);
    }
}

// Logout function - Use Firebase Auth sign out
function logout() {
    firebase.auth().signOut().then(() => {
        // The onAuthStateChanged listener will handle clearSession and updateNavigation
        console.log('User signed out via Firebase');
        window.location.href = 'index.html';
    }).catch(error => {
        console.error('Logout failed:', error.message);
    });
}

// --- UI HELPERS ---

// Set loading state on submit button
function setLoading(isLoading) {
    const submitBtn = document.getElementById('loginBtn') || document.getElementById('registerBtn');
    if (submitBtn) {
        // Store original text if not already stored
        if (!submitBtn.dataset.originalText) {
            submitBtn.dataset.originalText = submitBtn.innerText;
        }

        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Loading...';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerText = submitBtn.dataset.originalText;
        }
    }
}

// Display error message
function displayError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';
        setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
    } else {
        alert(message);
    }
}

// Update UI elements based on auth status
function updateNavigation() {
    const isLoggedInUser = isLoggedIn();
    const isUserAdmin = isAdmin();
    const loginLink = document.getElementById('loginLink');
    const userWelcome = document.getElementById('userWelcome');
    const logoutBtn = document.querySelector('.logout-btn');
    const adminLink = document.getElementById('adminLink');

    if (isLoggedInUser) {
        const user = getCurrentUser();

        if (loginLink) {
            loginLink.style.display = 'none';
        }
        if (userWelcome) {
            userWelcome.innerText = `Welcome, ${user.full_name || user.email.split('@')[0]}!`;
            userWelcome.style.display = 'inline';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
        
        if (adminLink) {
            adminLink.style.display = isUserAdmin ? 'block' : 'none';
        }

        console.log('✅ Navigation updated for logged in user');
    } else {
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

// --- FIREBASE AUTH STATE LISTENER (New & Crucial) ---
// This handles session persistence across page loads
// Note: Requires firebase-auth.js SDK loaded in HTML
if (typeof firebase !== 'undefined' && typeof clientDB !== 'undefined') {
    firebase.auth().onAuthStateChanged(async (authUser) => {
        if (authUser) {
            // User is signed in via Firebase Auth
            console.log('✅ Firebase Auth State Changed: User is signed in');
            
            // Fetch full profile data from Realtime DB
            const fullUser = await clientDB.fetchUserProfile(authUser.uid);
            
            if (fullUser) {
                // Store/update local session cache
                storeSession(fullUser);
                currentUser = fullUser;
            } else {
                console.warn("User authenticated but profile missing in DB. Signing out.");
                await firebase.auth().signOut();
            }

        } else {
            // User is signed out
            console.log('❌ Firebase Auth State Changed: User is signed out');
            clearSession(); // Clear local cache
        }
        
        // Always update the UI after state change
        updateNavigation();
    });
} else {
    // Fallback for pages that might not load all scripts in time
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(updateNavigation, 500);
    });
}

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
