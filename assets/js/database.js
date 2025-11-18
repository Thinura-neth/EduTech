// assets/js/database.js - Complete Text File Database
class TextFileDB {
    constructor() {
        this.filename = 'edutech_database.txt';
        this.initDatabase();
    }

    async initDatabase() {
        console.log('Initializing text file database...');
        if (!await this.fileExists(this.filename)) {
            await this.createDefaultData();
        }
    }

    async fileExists(filename) {
        try {
            return localStorage.getItem('file_' + filename) !== null;
        } catch (error) {
            return false;
        }
    }

    async readFile(filename) {
        try {
            const content = localStorage.getItem('file_' + filename);
            return content || '';
        } catch (error) {
            console.error('Error reading file:', error);
            return '';
        }
    }

    async writeFile(filename, content) {
        try {
            localStorage.setItem('file_' + filename, content);
            return true;
        } catch (error) {
            console.error('Error writing file:', error);
            return false;
        }
    }

    async createDefaultData() {
        console.log('Creating default database data...');
        const defaultData = `=== EduTech Database ===
Created: ${new Date().toLocaleString()}

=== USERS ===
1|admin@example.com|password123|Admin User|${new Date().toISOString()}|admin
2|serveradmin@gmail.com|Admin526|System Administrator|${new Date().toISOString()}|admin

=== COURSES ===
1|Web Development Bootcamp|Learn full-stack web development with modern technologies|299.99|120|🌐
2|Data Science Fundamentals|Python, Machine Learning and Data Analysis|399.99|100|📊
3|Mobile App Development|React Native and Flutter cross-platform development|349.99|90|📱
4|Cloud Computing|AWS, Azure and Google Cloud platform mastery|449.99|110|☁️
5|Cyber Security|Network security and ethical hacking|499.99|130|🔒
6|AI & Machine Learning|Deep learning and AI applications|599.99|150|🤖

=== USER_COURSES ===

=== LOGS ===
1|admin@example.com|Admin User|${new Date().toISOString()}|ADMIN_CREATED|
2|serveradmin@gmail.com|System Administrator|${new Date().toISOString()}|ADMIN_CREATED|
`;

        await this.writeFile(this.filename, defaultData);
        console.log('Default database created successfully');
    }

    // User Management Methods
    async verifyUser(email, password) {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            
            let inUsersSection = false;
            for (const line of lines) {
                if (line.trim() === '=== USERS ===') {
                    inUsersSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USERS ===') {
                    inUsersSection = false;
                }
                
                if (inUsersSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, userEmail, userPassword, fullName, createdAt, role] = line.split('|');
                    if (userEmail === email && userPassword === password) {
                        return {
                            id: parseInt(id),
                            email: userEmail,
                            password: userPassword,
                            full_name: fullName,
                            created_at: createdAt,
                            role: role
                        };
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Error in verifyUser:', error);
            return null;
        }
    }

    async createUser(email, password, fullName = '') {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            
            // Check if user already exists
            let userExists = false;
            let inUsersSection = false;
            for (const line of lines) {
                if (line.trim() === '=== USERS ===') {
                    inUsersSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USERS ===') {
                    inUsersSection = false;
                }
                
                if (inUsersSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, userEmail] = line.split('|');
                    if (userEmail === email) {
                        userExists = true;
                        break;
                    }
                }
            }

            if (userExists) {
                return null;
            }

            // Find max user ID
            let maxId = 0;
            inUsersSection = false;
            for (const line of lines) {
                if (line.trim() === '=== USERS ===') {
                    inUsersSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USERS ===') {
                    inUsersSection = false;
                }
                
                if (inUsersSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id] = line.split('|');
                    maxId = Math.max(maxId, parseInt(id));
                }
            }

            const newUser = {
                id: maxId + 1,
                email: email,
                password: password,
                full_name: fullName,
                created_at: new Date().toISOString(),
                role: 'user'
            };

            // Add user to file
            const newUserLine = `${newUser.id}|${newUser.email}|${newUser.password}|${newUser.full_name}|${newUser.created_at}|${newUser.role}`;
            
            let newContent = '';
            let usersSectionFound = false;
            
            for (let i = 0; i < lines.length; i++) {
                newContent += lines[i] + '\n';
                if (lines[i].trim() === '=== USERS ===') {
                    newContent += newUserLine + '\n';
                    usersSectionFound = true;
                }
            }

            if (!usersSectionFound) {
                newContent += '\n=== USERS ===\n' + newUserLine + '\n';
            }

            await this.writeFile(this.filename, newContent);
            
            // Log the registration
            await this.logUserAction(newUser, 'REGISTRATION');
            
            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    async getUsers() {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            const users = [];
            
            let inUsersSection = false;
            for (const line of lines) {
                if (line.trim() === '=== USERS ===') {
                    inUsersSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USERS ===') {
                    inUsersSection = false;
                }
                
                if (inUsersSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, email, password, fullName, createdAt, role] = line.split('|');
                    users.push({
                        id: parseInt(id),
                        email: email,
                        password: password,
                        full_name: fullName,
                        created_at: createdAt,
                        role: role
                    });
                }
            }
            
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    async getUserById(userId) {
        const users = await this.getUsers();
        return users.find(user => user.id === userId);
    }

    async deleteUser(userId) {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            
            let newContent = '';
            let userToDelete = null;
            let inUsersSection = false;
            
            for (const line of lines) {
                if (line.trim() === '=== USERS ===') {
                    inUsersSection = true;
                    newContent += line + '\n';
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USERS ===') {
                    inUsersSection = false;
                }
                
                if (inUsersSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, email, password, fullName, createdAt, role] = line.split('|');
                    if (parseInt(id) === userId) {
                        userToDelete = {
                            id: parseInt(id),
                            email: email,
                            password: password,
                            full_name: fullName,
                            created_at: createdAt,
                            role: role
                        };
                        // Skip this line (delete user)
                        continue;
                    }
                }
                newContent += line + '\n';
            }

            if (userToDelete) {
                await this.writeFile(this.filename, newContent);
                await this.logUserAction(userToDelete, 'USER_DELETED', 'Account deleted by admin');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }

    // Course Management Methods
    async getCourses() {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            const courses = [];
            
            let inCoursesSection = false;
            for (const line of lines) {
                if (line.trim() === '=== COURSES ===') {
                    inCoursesSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== COURSES ===') {
                    inCoursesSection = false;
                }
                
                if (inCoursesSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, title, description, price, duration_hours, image] = line.split('|');
                    courses.push({
                        id: parseInt(id),
                        title: title,
                        description: description,
                        price: parseFloat(price),
                        duration_hours: parseInt(duration_hours),
                        image: image
                    });
                }
            }
            
            return courses;
        } catch (error) {
            console.error('Error getting courses:', error);
            // Return default courses if error
            return [
                {
                    id: 1,
                    title: 'Web Development Bootcamp',
                    description: 'Learn full-stack web development with modern technologies',
                    price: 299.99,
                    duration_hours: 120,
                    image: '🌐'
                },
                {
                    id: 2,
                    title: 'Data Science Fundamentals',
                    description: 'Python, Machine Learning and Data Analysis',
                    price: 399.99,
                    duration_hours: 100,
                    image: '📊'
                }
            ];
        }
    }

    async getCourse(courseId) {
        const courses = await this.getCourses();
        return courses.find(c => c.id === courseId);
    }

    // Enrollment Methods
    async enrollUserInCourse(userId, courseId) {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            
            // Check if already enrolled
            let inUserCoursesSection = false;
            for (const line of lines) {
                if (line.trim() === '=== USER_COURSES ===') {
                    inUserCoursesSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USER_COURSES ===') {
                    inUserCoursesSection = false;
                }
                
                if (inUserCoursesSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, user_id, course_id] = line.split('|');
                    if (parseInt(user_id) === userId && parseInt(course_id) === courseId) {
                        return false; // Already enrolled
                    }
                }
            }

            // Find max enrollment ID
            let maxId = 0;
            inUserCoursesSection = false;
            for (const line of lines) {
                if (line.trim() === '=== USER_COURSES ===') {
                    inUserCoursesSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USER_COURSES ===') {
                    inUserCoursesSection = false;
                }
                
                if (inUserCoursesSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id] = line.split('|');
                    maxId = Math.max(maxId, parseInt(id));
                }
            }

            const newEnrollment = {
                id: maxId + 1,
                user_id: userId,
                course_id: courseId,
                enrolled_at: new Date().toISOString(),
                progress_percentage: 0
            };

            const newEnrollmentLine = `${newEnrollment.id}|${newEnrollment.user_id}|${newEnrollment.course_id}|${newEnrollment.enrolled_at}|${newEnrollment.progress_percentage}`;
            
            let newContent = '';
            let userCoursesSectionFound = false;
            
            for (let i = 0; i < lines.length; i++) {
                newContent += lines[i] + '\n';
                if (lines[i].trim() === '=== USER_COURSES ===') {
                    newContent += newEnrollmentLine + '\n';
                    userCoursesSectionFound = true;
                }
            }

            if (!userCoursesSectionFound) {
                newContent += '\n=== USER_COURSES ===\n' + newEnrollmentLine + '\n';
            }

            await this.writeFile(this.filename, newContent);
            return true;
        } catch (error) {
            console.error('Error enrolling user in course:', error);
            return false;
        }
    }

    async getUserEnrolledCourses(userId) {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            const courses = await this.getCourses();
            const enrolledCourses = [];
            
            let inUserCoursesSection = false;
            for (const line of lines) {
                if (line.trim() === '=== USER_COURSES ===') {
                    inUserCoursesSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USER_COURSES ===') {
                    inUserCoursesSection = false;
                }
                
                if (inUserCoursesSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, user_id, course_id, enrolled_at, progress_percentage] = line.split('|');
                    if (parseInt(user_id) === userId) {
                        const course = courses.find(c => c.id === parseInt(course_id));
                        if (course) {
                            enrolledCourses.push({
                                ...course,
                                enrolled_at: enrolled_at,
                                progress_percentage: parseInt(progress_percentage)
                            });
                        }
                    }
                }
            }
            
            return enrolledCourses;
        } catch (error) {
            console.error('Error getting user enrolled courses:', error);
            return [];
        }
    }

    async updateCourseProgress(userId, courseId, progress) {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            
            let newContent = '';
            let inUserCoursesSection = false;
            let updated = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if (line.trim() === '=== USER_COURSES ===') {
                    inUserCoursesSection = true;
                    newContent += line + '\n';
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== USER_COURSES ===') {
                    inUserCoursesSection = false;
                }
                
                if (inUserCoursesSection && line.trim() && !line.trim().startsWith('===')) {
                    const [id, user_id, course_id, enrolled_at, progress_percentage] = line.split('|');
                    if (parseInt(user_id) === userId && parseInt(course_id) === courseId) {
                        // Update progress
                        newContent += `${id}|${user_id}|${course_id}|${enrolled_at}|${progress}\n`;
                        updated = true;
                        continue;
                    }
                }
                newContent += line + '\n';
            }

            if (updated) {
                await this.writeFile(this.filename, newContent);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error updating course progress:', error);
            return false;
        }
    }

    // Logging Methods
    async logUserAction(user, actionType, additionalInfo = '') {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            
            let newContent = '';
            let logsSectionFound = false;
            let logId = 1;
            
            // Find max log ID
            for (const line of lines) {
                if (line.trim().startsWith('=== LOGS ===')) {
                    logsSectionFound = true;
                    continue;
                }
                if (logsSectionFound && line.trim() && !line.trim().startsWith('===')) {
                    const [existingLogId] = line.split('|');
                    logId = Math.max(logId, parseInt(existingLogId) + 1);
                }
            }

            const logLine = `${logId}|${user.email}|${user.full_name}|${new Date().toISOString()}|${actionType}|${additionalInfo}`;
            
            logsSectionFound = false;
            for (let i = 0; i < lines.length; i++) {
                newContent += lines[i] + '\n';
                if (lines[i].trim() === '=== LOGS ===') {
                    newContent += logLine + '\n';
                    logsSectionFound = true;
                }
            }

            if (!logsSectionFound) {
                newContent += '\n=== LOGS ===\n' + logLine + '\n';
            }

            await this.writeFile(this.filename, newContent);
        } catch (error) {
            console.error('Error logging user action:', error);
        }
    }

    async getUserLogs() {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            const logs = [];
            
            let inLogsSection = false;
            for (const line of lines) {
                if (line.trim() === '=== LOGS ===') {
                    inLogsSection = true;
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== LOGS ===') {
                    inLogsSection = false;
                }
                
                if (inLogsSection && line.trim() && !line.trim().startsWith('===')) {
                    const [logId, email, fullName, loggedAt, logType, action] = line.split('|');
                    logs.push({
                        log_id: parseInt(logId),
                        email: email,
                        full_name: fullName,
                        logged_at: loggedAt,
                        log_type: logType,
                        action: action
                    });
                }
            }
            
            return logs;
        } catch (error) {
            console.error('Error getting user logs:', error);
            return [];
        }
    }

    async clearUserLogs() {
        try {
            const content = await this.readFile(this.filename);
            const lines = content.split('\n');
            
            let newContent = '';
            let inLogsSection = false;
            
            for (const line of lines) {
                if (line.trim() === '=== LOGS ===') {
                    inLogsSection = true;
                    newContent += line + '\n';
                    continue;
                }
                if (line.trim().startsWith('===') && line.trim() !== '=== LOGS ===') {
                    inLogsSection = false;
                }
                
                if (!inLogsSection) {
                    newContent += line + '\n';
                }
            }

            await this.writeFile(this.filename, newContent);
            return true;
        } catch (error) {
            console.error('Error clearing user logs:', error);
            return false;
        }
    }

    // Download Methods
    async downloadUserAccounts() {
        try {
            const users = await this.getUsers();
            let fileContent = '=== EduTech User Accounts ===\n';
            fileContent += `Generated: ${new Date().toLocaleString()}\n`;
            fileContent += `Total Users: ${users.length}\n\n`;
            
            users.forEach(user => {
                fileContent += `User ID: ${user.id}\n`;
                fileContent += `Name: ${user.full_name || 'Not provided'}\n`;
                fileContent += `Email: ${user.email}\n`;
                fileContent += `Password: ${user.password}\n`;
                fileContent += `Role: ${user.role}\n`;
                fileContent += `Registered: ${new Date(user.created_at).toLocaleString()}\n`;
                fileContent += '─'.repeat(40) + '\n\n';
            });

            this.downloadFile(fileContent, `edutech_users_${new Date().toISOString().split('T')[0]}.txt`);
            return true;
        } catch (error) {
            console.error('Error downloading user accounts:', error);
            return false;
        }
    }

    async downloadFullDatabase() {
        try {
            const content = await this.readFile(this.filename);
            this.downloadFile(content, 'edutech_database_backup.txt');
            return true;
        } catch (error) {
            console.error('Error downloading database:', error);
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
}

// Create global instance
const clientDB = new TextFileDB();