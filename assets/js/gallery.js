// Project data with proper image handling
const projects = [
    {
        id: 1,
        title: "E-Commerce Platform",
        category: "web",
        description: "Full-stack e-commerce solution with React and Node.js featuring user authentication, product management, shopping cart, and payment integration.",
        technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API"],
        features: ["User Authentication", "Product Management", "Shopping Cart", "Payment Processing", "Order Tracking"],
        image: "assets/images/projects/web-project-1.jpg",
        imagePlaceholder: "🛒",
        demo: "#",
        github: "#"
    },
    {
        id: 2,
        title: "Fitness Tracker App",
        category: "mobile",
        description: "Cross-platform mobile application for fitness tracking with workout plans, progress monitoring, and social features.",
        technologies: ["Flutter", "Dart", "Firebase", "Google Fit API"],
        features: ["Workout Plans", "Progress Tracking", "Social Features", "Health Integration"],
        image: "assets/images/projects/mobile-project-1.jpg",
        imagePlaceholder: "💪",
        demo: "#",
        github: "#"
    },
    {
        id: 3,
        title: "Banking App UI",
        category: "design",
        description: "Modern banking interface with seamless user experience and intuitive design patterns.",
        technologies: ["Figma", "UI Design", "Prototyping", "User Research"],
        features: ["Modern UI", "User Experience", "Prototyping", "Design System"],
        image: "assets/images/projects/design-project-1.jpg",
        imagePlaceholder: "🏦",
        demo: "#",
        github: "#"
    },
    {
        id: 4,
        title: "Sales Analytics Dashboard",
        category: "data",
        description: "Interactive dashboard for business intelligence and sales performance analysis.",
        technologies: ["Python", "Tableau", "SQL", "Pandas"],
        features: ["Data Visualization", "Business Intelligence", "Performance Analysis", "Real-time Data"],
        image: "assets/images/projects/data-project-1.jpg",
        imagePlaceholder: "📊",
        demo: "#",
        github: "#"
    },
    {
        id: 5,
        title: "Social Media Platform",
        category: "web",
        description: "Real-time social network with Vue.js and Socket.io featuring instant messaging and content sharing.",
        technologies: ["Vue.js", "Express", "WebSockets", "MongoDB"],
        features: ["Real-time Chat", "Content Sharing", "User Profiles", "Notifications"],
        image: "assets/images/projects/web-project-2.jpg",
        imagePlaceholder: "👥",
        demo: "#",
        github: "#"
    },
    {
        id: 6,
        title: "Food Delivery App",
        category: "mobile",
        description: "React Native app with real-time order tracking and restaurant management system.",
        technologies: ["React Native", "Redux", "Google Maps", "Firebase"],
        features: ["Order Tracking", "Restaurant Management", "Real-time Updates", "Payment Integration"],
        image: "assets/images/projects/mobile-project-2.jpg",
        imagePlaceholder: "🍕",
        demo: "#",
        github: "#"
    },
    {
        id: 7,
        title: "Travel Booking Website",
        category: "design",
        description: "Complete travel booking platform design system with user-friendly interface.",
        technologies: ["Adobe XD", "Design System", "User Research", "Prototyping"],
        features: ["Booking System", "User Interface", "Design System", "User Research"],
        image: "assets/images/projects/design-project-2.jpg",
        imagePlaceholder: "✈️",
        demo: "#",
        github: "#"
    },
    {
        id: 8,
        title: "COVID-19 Data Analysis",
        category: "data",
        description: "Data visualization and predictive modeling for COVID-19 spread analysis.",
        technologies: ["Pandas", "Matplotlib", "Machine Learning", "Data Analysis"],
        features: ["Data Visualization", "Predictive Modeling", "Statistical Analysis", "Dashboard"],
        image: "assets/images/projects/data-project-2.jpg",
        imagePlaceholder: "🦠",
        demo: "#",
        github: "#"
    }
];

// Initialize gallery
function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    galleryGrid.innerHTML = projects.map(project => `
        <div class="gallery-item" data-category="${project.category}" data-title="${project.title.toLowerCase()}">
            <div class="gallery-card">
                <div class="project-image" 
                     style="background-image: url('${project.image}')"
                     data-emoji="${project.imagePlaceholder}">
                </div>
                <div class="project-overlay">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-tags">
                            ${project.technologies.slice(0, 3).map(tech => `<span>${tech}</span>`).join('')}
                            ${project.technologies.length > 3 ? `<span>+${project.technologies.length - 3} more</span>` : ''}
                        </div>
                    </div>
                    <button class="view-project-btn" onclick="viewProject(${project.id})">View Project</button>
                </div>
            </div>
        </div>
    `).join('');

    // Add animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.gallery-item').forEach(item => {
        observer.observe(item);
    });
}

// View project details
function viewProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2>${project.title}</h2>
        <div class="project-details">
            <p>${project.description}</p>
            
            <div class="project-specs">
                <div class="spec-section">
                    <h4>🛠️ Technologies Used</h4>
                    <div class="tech-tags">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                
                <div class="spec-section">
                    <h4>✨ Key Features</h4>
                    <ul>
                        ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="project-links">
                <a href="${project.demo}" class="btn btn-primary" target="_blank">Live Demo</a>
                <a href="${project.github}" class="btn btn-secondary" target="_blank">GitHub</a>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Project submission form functions
function showProjectForm() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please login to submit a project.');
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('projectFormModal').style.display = 'block';
}

function closeProjectForm() {
    document.getElementById('projectFormModal').style.display = 'none';
    document.getElementById('projectForm').reset();
}

// Firebase project submission
async function submitProjectToFirebase(projectData) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');

        const projectRef = firebase.database().ref('projects').push();
        await projectRef.set({
            ...projectData,
            submittedBy: user.uid,
            submittedAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'pending'
        });
        
        return true;
    } catch (error) {
        console.error('Error submitting project:', error);
        return false;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    loadGallery();

    // Gallery filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const searchInput = document.getElementById('searchInput');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        galleryItems.forEach(item => {
            const title = item.getAttribute('data-title');
            if (title.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Modal functionality
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-modal');

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Project form submission
    document.getElementById('projectForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('projectTitle').value,
            category: document.getElementById('projectCategory').value,
            description: document.getElementById('projectDescription').value,
            technologies: document.getElementById('projectTechnologies').value.split(',').map(tech => tech.trim()),
            features: document.getElementById('projectFeatures').value.split(',').map(feature => feature.trim()),
            demo: document.getElementById('projectDemo').value || '#',
            github: document.getElementById('projectGithub').value || '#',
            imagePlaceholder: getCategoryEmoji(document.getElementById('projectCategory').value)
        };

        const success = await submitProjectToFirebase(formData);
        if (success) {
            alert('Project submitted successfully! It will be reviewed before appearing in the gallery.');
            closeProjectForm();
        } else {
            alert('Error submitting project. Please try again.');
        }
    });

    // Animate stats
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const finalValue = stat.textContent;
        stat.textContent = '0';
        
        let current = 0;
        const increment = finalValue.includes('+') ? 10 : 1;
        const target = parseFloat(finalValue);
        
        const timer = setInterval(() => {
            current += increment;
            stat.textContent = current.toFixed(current % 1 === 0 ? 0 : 0) + (finalValue.includes('+') ? '+' : '%');
            
            if (current >= target) {
                stat.textContent = finalValue;
                clearInterval(timer);
            }
        }, 50);
    });
});

// Helper function to get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        'web': '🌐',
        'mobile': '📱',
        'design': '🎨',
        'data': '📊'
    };
    return emojis[category] || '🚀';
}

// Load projects from Firebase (optional)
function loadProjectsFromFirebase() {
    const projectsRef = firebase.database().ref('projects');
    projectsRef.on('value', (snapshot) => {
        const projectsData = snapshot.val();
        if (projectsData) {
            // Convert object to array and filter approved projects
            const approvedProjects = Object.values(projectsData)
                .filter(project => project.status === 'approved');
            
            // You can merge with static projects or replace them
            console.log('Loaded projects from Firebase:', approvedProjects);
        }
    });
}