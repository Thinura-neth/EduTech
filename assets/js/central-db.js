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

    // User Management
    async verifyUser(email, password) {
        if (!this.initialized) {
            console.error('Firebase not initialized');
            return null;
        }

        try {
            const snapshot = await this.db.ref('users').orderByChild('email').equalTo(email).once('value');
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                const userId = Object.keys(users)[0];
                const user = users[userId];
                
                if (user.password === password) {
                    console.log('✅ User verified:', email);
                    return {
                        id: userId,
                        ...user
                    };
                }
            }
            
            console.log('❌ Invalid credentials for:', email);
            return null;
        } catch (error) {
            console.error('Error verifying user:', error);
            return null;
        }
    }

    async registerUser(fullName, email, password) {
        if (!this.initialized) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            // Check if user already exists
            const snapshot = await this.db.ref('users').orderByChild('email').equalTo(email).once('value');
            if (snapshot.exists()) {
                console.warn('❌ Registration failed: Email already exists');
                return false;
            }

            const newUserRef = this.db.ref('users').push();
            const newUserId = newUserRef.key;
            
            const userData = {
                full_name: fullName,
                email: email,
                password: password, // In a real app, hash this!
                role: 'user', // Default role
                created_at: firebase.database.ServerValue.TIMESTAMP
            };

            await newUserRef.set(userData);
            console.log('✅ User registered successfully:', email);
            return { id: newUserId, ...userData };

        } catch (error) {
            console.error('❌ Error registering user:', error);
            return false;
        }
    }

    async updateUserDetails(userId, data) {
        if (!this.initialized) return false;
        try {
            const userRef = this.db.ref(`users/${userId}`);
            await userRef.update(data);
            console.log('✅ User details updated:', userId);
            return true;
        } catch (error) {
            console.error('❌ Error updating user details:', error);
            return false;
        }
    }

    // =================================================================
    // AD/MARKETPLACE Management (using both Firebase & LocalStorage for demo)
    // =================================================================

    async saveUserAd(adData, imageFile) {
        // Firebase Storage functions are NOT available in v8 CDN for Realtime Database/App-Only setup.
        // We will mock file upload logic here for Realtime Ads API.
        console.log('⚠️ Using localStorage fallback for user ad saving and fetching as Firebase Storage is not initialized in this simplified setup.');
        
        // Fallback to localStorage
        return this.saveUserAdToLocalStorage(adData);
    }
};

const clientDB = new CentralDB();

// Fallback logic (for demo simplicity without Firebase Storage)
clientDB.getUserAds = async function() {
    try {
        // Mock Firebase Realtime Database logic (if it were implemented)
        // const adsRef = clientDB.db.ref('user_ads');
        // const snapshot = await adsRef.once('value');
        // const adsData = snapshot.val();
        
        // if (!adsData) return [];
        
        // return Object.values(adsData).filter(ad => ad.status === 'approved');
        
        throw new Error('Using localStorage for demo ads.');
    } catch (error) {
        // console.error('Error getting user ads:', error);
        
        // Fallback to localStorage
        return this.getUserAdsFromLocalStorage();
    }
};

clientDB.saveUserAdToLocalStorage = function(adData) {
    try {
        const ads = JSON.parse(localStorage.getItem('edutech_user_ads') || '[]');
        const adId = 'ad_' + Date.now();
        
        ads.push({
            id: adId,
            ...adData,
            status: 'approved', // Auto-approve for demo
            views: 0,
            createdAt: new Date().toISOString(),
            imageUrl: 'assets/images/placeholder-ad.png' // Mock image for localStorage
        });
        
        localStorage.setItem('edutech_user_ads', JSON.stringify(ads));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

clientDB.getUserAdsFromLocalStorage = function() {
    try {
        const ads = JSON.parse(localStorage.getItem('edutech_user_ads') || '[]');
        return ads.filter(ad => ad.status === 'approved');
    } catch (error) {
        console.error('Error getting from localStorage:', error);
        return [];
    }
};

// Make the clientDB instance available globally
window.clientDB = clientDB;