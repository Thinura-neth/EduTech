// assets/js/central-db.js - Complete Firebase Database System (නිවැරදි කළ)
class CentralDB {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            // නිවැරදි Firebase ආරම්භක ක්‍රමය
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            } else {
                firebase.app(); // දැනටමත් ආරම්භ කළ app භාවිතා කරන්න
            }
            this.db = firebase.database();
            this.initialized = true;
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.initialized = false;
        }
    }

    // --- User Management (Updated for Firebase Auth) ---
    // Insecure verifyUser(email, password) and the old registerUser() functions are REMOVED.

    // New function to save user profile data after successful Firebase Auth registration
    async saveUserProfile(uid, full_name, email, role = 'user') {
        if (!this.initialized) {
            console.error('Firebase not initialized');
            return null;
        }
        try {
            const usersRef = this.db.ref('users/' + uid);
            const userData = {
                full_name,
                email,
                role,
                created_at: new Date().toISOString()
            };
            await usersRef.set(userData);
            console.log('✅ User profile saved to DB:', email);
            return { id: uid, ...userData };
        } catch (error) {
            console.error('❌ Error saving user profile:', error);
            return null;
        }
    }
    
    // New function to fetch user profile data for session management (uses UID from Firebase Auth)
    async fetchUserProfile(uid) {
        if (!this.initialized) {
            console.error('Firebase not initialized');
            return null;
        }
        try {
            const snapshot = await this.db.ref('users/' + uid).once('value');
            if (snapshot.exists()) {
                const user = snapshot.val();
                return {
                    id: uid,
                    ...user
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            return null;
        }
    }

    // Function to update profile (useful for the profile.html page)
    async updateProfile(user_id, updates) {
        if (!this.initialized) {
            console.error('Firebase not initialized');
            return false;
        }
        try {
            await this.db.ref('users/' + user_id).update(updates);
            console.log('✅ User profile updated:', user_id);
            return true;
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            return false;
        }
    }

    // --- Ad Management (These functions remain the same as the original demo) ---

    async saveUserAd(adData) {
        if (this.initialized) {
            try {
                const newAdRef = this.db.ref('user_ads').push();
                const adId = newAdRef.key;
                const payload = {
                    id: adId,
                    ...adData,
                    status: 'approved', // Auto-approve for demo
                    views: 0,
                    createdAt: new Date().toISOString()
                };
                await newAdRef.set(payload);
                return true;
            } catch (error) {
                console.error('Error saving ad to Firebase:', error);
            }
        }
        // Fallback to localStorage
        return this.saveUserAdToLocalStorage(adData);
    }
    
    // (Other ad management functions like getUserAds, saveUserAdToLocalStorage, etc. 
    // from the original file should follow here to complete the class)
    // Since I cannot access the full original file, please ensure your original functions 
    // are included here if you want a complete file replacement.
};

const clientDB = new CentralDB();
