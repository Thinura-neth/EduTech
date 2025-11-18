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
            console.log('❌ User not found or invalid password:', email);
            return null;
        } catch (error) {
            console.error('Verify user error:', error);
            return null;
        }
    }

    async createUser(email, password, fullName = '') {
        if (!this.initialized) {
            console.error('Firebase not initialized');
            return null;
        }

        try {
            // Check if user already exists
            const existingUser = await this.verifyUser(email, 'dummy');
            if (existingUser) {
                console.log('❌ User already exists:', email);
                return null;
            }

            const newUser = {
                email: email,
                password: password,
                full_name: fullName || email.split('@')[0],
                role: email === 'admin@example.com' ? 'admin' : 'user',
                status: 'active',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                login_count: 1
            };

            const userRef = this.db.ref('users').push();
            await userRef.set(newUser);

            // Log the registration
            await this.logAction({
                id: userRef.key,
                email: email,
                full_name: newUser.full_name
            }, 'REGISTRATION', `New user registered`);

            console.log('✅ User created successfully:', email);
            return { id: userRef.key, ...newUser };
        } catch (error) {
            console.error('Create user error:', error);
            return null;
        }
    }

    async getUsers() {
        if (!this.initialized) return [];

        try {
            const snapshot = await this.db.ref('users').once('value');
            if (!snapshot.exists()) return [];

            const users = snapshot.val();
            return Object.keys(users).map(key => ({
                id: key,
                ...users[key]
            }));
        } catch (error) {
            console.error('Get users error:', error);
            return [];
        }
    }

    async getUserById(userId) {
        if (!this.initialized) return null;

        try {
            const snapshot = await this.db.ref('users/' + userId).once('value');
            return snapshot.exists() ? { id: userId, ...snapshot.val() } : null;
        } catch (error) {
            console.error('Get user by ID error:', error);
            return null;
        }
    }

    async updateUser(userId, updates) {
        if (!this.initialized) return false;

        try {
            await this.db.ref('users/' + userId).update(updates);
            return true;
        } catch (error) {
            console.error('Update user error:', error);
            return false;
        }
    }

    async deleteUser(userId) {
        if (!this.initialized) return false;

        try {
            const user = await this.getUserById(userId);
            if (user && user.role === 'admin') {
                console.log('❌ Cannot delete admin user');
                return false;
            }

            await this.db.ref('users/' + userId).remove();
            
            // Log the deletion
            if (user) {
                await this.logAction(user, 'USER_DELETED', `User account deleted`);
            }

            console.log('✅ User deleted successfully:', userId);
            return true;
        } catch (error) {
            console.error('Delete user error:', error);
            return false;
        }
    }

    // Course Management
    async getCourses() {
        if (!this.initialized) return [];

        try {
            const snapshot = await this.db.ref('courses').once('value');
            if (!snapshot.exists()) {
                // Create default courses if none exist
                await this.createDefaultCourses();
                return this.getCourses();
            }

            const courses = snapshot.val();
            return Object.keys(courses).map(key => ({
                id: key,
                ...courses[key]
            }));
        } catch (error) {
            console.error('Get courses error:', error);
            return [];
        }
    }

    async createDefaultCourses() {
        const defaultCourses = [
            {
                title: "Web Development Fundamentals",
                description: "Learn HTML, CSS, JavaScript and modern frameworks like React and Node.js",
                price: 299.99,
                duration_hours: 120,
                image: "🌐",
                category: "web",
                created_at: new Date().toISOString()
            },
            {
                title: "Data Science Fundamentals", 
                description: "Python, Machine Learning, Data Analysis and Visualization techniques",
                price: 399.99,
                duration_hours: 100,
                image: "📊",
                category: "data",
                created_at: new Date().toISOString()
            },
            {
                title: "Mobile Development",
                description: "React Native, Flutter, and iOS/Android development with real projects",
                price: 349.99,
                duration_hours: 90,
                image: "📱",
                category: "mobile",
                created_at: new Date().toISOString()
            }
        ];

        try {
            for (const course of defaultCourses) {
                await this.db.ref('courses').push(course);
            }
            console.log('✅ Default courses created');
        } catch (error) {
            console.error('Create default courses error:', error);
        }
    }

    // User Course Enrollment
    async enrollUserInCourse(userId, courseId) {
        if (!this.initialized) return false;

        try {
            // Check if already enrolled
            const enrollment = await this.getUserEnrollment(userId, courseId);
            if (enrollment) {
                console.log('❌ User already enrolled in this course');
                return false;
            }

            const enrollmentData = {
                user_id: userId,
                course_id: courseId,
                enrolled_at: new Date().toISOString(),
                progress_percentage: 0,
                status: 'active'
            };

            await this.db.ref('user_courses').push(enrollmentData);
            console.log('✅ User enrolled in course successfully');
            return true;
        } catch (error) {
            console.error('Enroll user in course error:', error);
            return false;
        }
    }

    async getUserEnrollment(userId, courseId) {
        if (!this.initialized) return null;

        try {
            const snapshot = await this.db.ref('user_courses')
                .orderByChild('user_id')
                .equalTo(userId)
                .once('value');

            if (snapshot.exists()) {
                const enrollments = snapshot.val();
                for (const key in enrollments) {
                    if (enrollments[key].course_id === courseId) {
                        return { id: key, ...enrollments[key] };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Get user enrollment error:', error);
            return null;
        }
    }

    async getUserEnrolledCourses(userId) {
        if (!this.initialized) return [];

        try {
            const enrollmentsSnapshot = await this.db.ref('user_courses')
                .orderByChild('user_id')
                .equalTo(userId)
                .once('value');

            if (!enrollmentsSnapshot.exists()) return [];

            const enrollments = enrollmentsSnapshot.val();
            const courses = await this.getCourses();
            const userCourses = [];

            for (const enrollmentKey in enrollments) {
                const enrollment = enrollments[enrollmentKey];
                const course = courses.find(c => c.id === enrollment.course_id);
                if (course) {
                    userCourses.push({
                        ...course,
                        enrollment_id: enrollmentKey,
                        progress_percentage: enrollment.progress_percentage || 0,
                        enrolled_at: enrollment.enrolled_at
                    });
                }
            }

            return userCourses;
        } catch (error) {
            console.error('Get user enrolled courses error:', error);
            return [];
        }
    }

    async updateCourseProgress(userId, courseId, progress) {
        if (!this.initialized) return false;

        try {
            const enrollment = await this.getUserEnrollment(userId, courseId);
            if (!enrollment) {
                console.log('❌ User not enrolled in this course');
                return false;
            }

            await this.db.ref('user_courses/' + enrollment.id).update({
                progress_percentage: Math.min(100, Math.max(0, progress)),
                last_updated: new Date().toISOString()
            });

            console.log('✅ Course progress updated successfully');
            return true;
        } catch (error) {
            console.error('Update course progress error:', error);
            return false;
        }
    }

    // Logging System
    async logAction(user, action, details = '') {
        if (!this.initialized) return;

        try {
            const logData = {
                user_id: user.id,
                email: user.email,
                full_name: user.full_name,
                log_type: action,
                action: details,
                logged_at: new Date().toISOString()
            };

            await this.db.ref('logs').push(logData);
        } catch (error) {
            console.error('Log action error:', error);
        }
    }

    async getUserLogs() {
        if (!this.initialized) return [];

        try {
            const snapshot = await this.db.ref('logs').once('value');
            if (!snapshot.exists()) return [];

            const logs = snapshot.val();
            return Object.keys(logs).map(key => ({
                id: key,
                ...logs[key]
            }));
        } catch (error) {
            console.error('Get user logs error:', error);
            return [];
        }
    }

    async clearUserLogs() {
        if (!this.initialized) return false;

        try {
            await this.db.ref('logs').remove();
            console.log('✅ User logs cleared successfully');
            return true;
        } catch (error) {
            console.error('Clear user logs error:', error);
            return false;
        }
    }

    // Admin Functions
    async downloadUserAccounts() {
        if (!this.initialized) return false;

        try {
            const users = await this.getUsers();
            let content = '=== EDU-TECH USER ACCOUNTS ===\n';
            content += `Generated: ${new Date().toLocaleString()}\n`;
            content += `Total Users: ${users.length}\n\n`;

            users.forEach((user, index) => {
                content += `USER ${index + 1}:\n`;
                content += `ID: ${user.id}\n`;
                content += `Name: ${user.full_name || 'No Name'}\n`;
                content += `Email: ${user.email}\n`;
                content += `Password: ${user.password}\n`;
                content += `Role: ${user.role}\n`;
                content += `Status: ${user.status}\n`;
                content += `Created: ${new Date(user.created_at).toLocaleString()}\n`;
                content += `Last Login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}\n`;
                content += `Login Count: ${user.login_count || 0}\n`;
                content += '─'.repeat(40) + '\n\n';
            });

            this.downloadFile(content, `edutech_users_${Date.now()}.txt`);
            return true;
        } catch (error) {
            console.error('Download user accounts error:', error);
            return false;
        }
    }

    async downloadFullDatabase() {
        if (!this.initialized) return false;

        try {
            const [users, courses, logs] = await Promise.all([
                this.getUsers(),
                this.getCourses(),
                this.getUserLogs()
            ]);

            let content = '=== EDU-TECH FULL DATABASE EXPORT ===\n';
            content += `Generated: ${new Date().toLocaleString()}\n\n`;

            // Users section
            content += 'USERS:\n';
            content += '─'.repeat(40) + '\n';
            users.forEach((user, index) => {
                content += `${index + 1}. ${user.email} (${user.role})\n`;
            });
            content += '\n';

            // Courses section  
            content += 'COURSES:\n';
            content += '─'.repeat(40) + '\n';
            courses.forEach((course, index) => {
                content += `${index + 1}. ${course.title} - $${course.price}\n`;
            });
            content += '\n';

            // Logs section
            content += 'RECENT LOGS:\n';
            content += '─'.repeat(40) + '\n';
            logs.slice(-10).forEach((log, index) => {
                content += `${index + 1}. [${new Date(log.logged_at).toLocaleString()}] ${log.email} - ${log.log_type}\n`;
            });

            this.downloadFile(content, `edutech_database_${Date.now()}.txt`);
            return true;
        } catch (error) {
            console.error('Download full database error:', error);
            return false;
        }
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Initialize default admin user
    async initializeDefaultAdmin() {
        if (!this.initialized) return;

        try {
            const adminExists = await this.verifyUser('admin@example.com', 'password123');
            if (!adminExists) {
                await this.createUser('admin@example.com', 'password123', 'System Administrator');
                await this.logAction(
                    { id: 'system', email: 'system@edutech.com', full_name: 'System' },
                    'ADMIN_CREATED',
                    'Default admin account created'
                );
                console.log('✅ Default admin user created');
            }
        } catch (error) {
            console.error('Initialize default admin error:', error);
        }
    }
}

// Global instance
const clientDB = new CentralDB();

// Initialize default data when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            clientDB.initializeDefaultAdmin();
        }, 2000);
    });
} else {
    setTimeout(() => {
        clientDB.initializeDefaultAdmin();
    }, 2000);
}


// Update user name
async function updateUserName(userId, newName) {
    try {
        console.log('Updating user name for:', userId, 'New name:', newName);
        
        if (!userId || userId === 'undefined' || userId.includes('undefined')) {
            console.error('Invalid user ID:', userId);
            return false;
        }
        
        // Get current user data first to verify user exists
        const userRef = firebase.database().ref('users/' + userId);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            console.error('User not found in database:', userId);
            return false;
        }
        
        // Update the full_name field
        await userRef.update({
            full_name: newName,
            updated_at: new Date().toISOString()
        });
        
        console.log('User name updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating user name:', error);
        return false;
    }
}

// Verify user password
async function verifyUserPassword(email, password) {
    try {
        console.log('Verifying password for:', email);
        
        const usersRef = firebase.database().ref('users');
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
        
        if (snapshot.exists()) {
            const users = snapshot.val();
            const userKey = Object.keys(users)[0];
            const userData = users[userKey];
            
            console.log('User found, verifying password...');
            // Simple password check (in real app, use proper hashing)
            const isValid = userData.password === password;
            console.log('Password verification result:', isValid);
            return isValid;
        }
        
        console.log('User not found with email:', email);
        return false;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}

// Update user password
async function updateUserPassword(userId, newPassword) {
    try {
        console.log('Updating password for user:', userId);
        
        if (!userId || userId === 'undefined' || userId.includes('undefined')) {
            console.error('Invalid user ID:', userId);
            return false;
        }
        
        const userRef = firebase.database().ref('users/' + userId);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            console.error('User not found:', userId);
            return false;
        }
        
        // Update the password field
        await userRef.update({
            password: newPassword,
            updated_at: new Date().toISOString()
        });
        
        console.log('User password updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating user password:', error);
        return false;
    }
}

// Get user by ID with better error handling
async function getUserById(userId) {
    try {
        if (!userId || userId === 'undefined') {
            console.error('Invalid user ID provided:', userId);
            return null;
        }
        
        const userRef = firebase.database().ref('users/' + userId);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            return {
                id: userId,
                ...userData
            };
        }
        console.log('User not found with ID:', userId);
        return null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}
