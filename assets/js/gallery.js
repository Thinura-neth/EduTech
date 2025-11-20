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
        features: ["Modern UI", "User Experience (UX)", "Design System", "Interactive Prototype"],
        image: "assets/images/projects/design-project-1.jpg",
        imagePlaceholder: "🎨",
        demo: "#",
        github: "#"
    },
    {
        id: 4,
        title: "Machine Learning API",
        category: "data",
        description: "A Python-based REST API for predicting housing prices using a trained machine learning model.",
        technologies: ["Python", "Flask", "Scikit-learn", "Pandas"],
        features: ["Data Preprocessing", "Model Training", "REST API Endpoint", "Dockerized Deployment"],
        image: "assets/images/projects/data-project-1.jpg",
        imagePlaceholder: "🧠",
        demo: "#",
        github: "#"
    }
];

let currentProjects = projects;

// Function to render projects
function renderProjects(projectsToRender) {
    const container = document.getElementById('projectsContainer');
    container.innerHTML = '';
    
    if (projectsToRender.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No projects found for this filter/search.</p>';
        return;
    }

    projectsToRender.forEach(project => {
        const card = document.createElement('div');
        card.className = 'gallery-card fade-in';
        card.innerHTML = `
            <div class="project-image" style="background-image: url('${project.image}');">
                ${project.image ? '' : project.imagePlaceholder}
            </div>
            <div class="project-overlay">
                <div class="project-info">
                    <h3>${getCategoryEmoji(project.category)} ${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
                    </div>
                </div>
                <div class="project-actions">
                    <a href="${project.demo}" class="btn btn-small btn-primary" target="_blank">View Demo</a>
                    <a href="${project.github}" class="btn btn-small btn-secondary" target="_blank">GitHub</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Function to filter projects
function filterProjects(category) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    document.querySelector(`.filter-btn[data-category="${category}"]`).classList.add('active');

    if (category === 'all') {
        currentProjects = projects;
    } else {
        currentProjects = projects.filter(p => p.category === category);
    }
    
    // Re-apply search filter if there's text in the search box
    searchProjects(); 
}

// Function to search projects
function searchProjects() {
    const searchInput = document.getElementById('projectSearch');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        renderProjects(currentProjects); // Render currently filtered projects
        return;
    }

    const filteredAndSearched = currentProjects.filter(project => 
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query))
    );

    renderProjects(filteredAndSearched);
}

// Function to handle form submission (submit project)
function submitProject(event) {
    event.preventDefault();

    const title = document.getElementById('projectTitle').value.trim();
    const category = document.getElementById('projectCategory').value;
    const description = document.getElementById('projectDescription').value.trim();
    const technologies = document.getElementById('projectTechnologies').value.split(',').map(t => t.trim());
    const features = document.getElementById('projectFeatures').value.split(',').map(f => f.trim());
    const demo = document.getElementById('projectDemo').value.trim();
    const github = document.getElementById('projectGithub').value.trim();

    if (!title || !category || !description) {
        alert('Please fill in all required fields.');
        return;
    }

    const newProject = {
        id: Date.now(), // Unique ID
        title,
        category,
        description,
        technologies,
        features,
        image: "assets/images/projects/placeholder.jpg", // Placeholder for user submissions
        imagePlaceholder: "❓",
        demo,
        github,
        status: 'pending' // Should be approved by admin in a real system
    };

    // In a real application, you'd send this to Firebase using a function like:
    // clientDB.saveProject(newProject).then(...)
    console.log('Project submitted:', newProject);
    alert('Project submitted for review! (Demo submission: Data not persisted)');
    
    closeProjectForm();
    document.getElementById('projectSubmissionForm').reset();
}

// Function to open the project submission modal
function openProjectForm() {
    if (!isLoggedIn()) {
        alert('Please log in to submit a project.');
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('projectModal').style.display = 'flex';
}

// Function to close the project submission modal
function closeProjectForm() {
    document.getElementById('projectModal').style.display = 'none';
}

// Initialize gallery on load
document.addEventListener('DOMContentLoaded', function() {
    // Initial render
    renderProjects(projects);

    // Attach filter event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterProjects(btn.dataset.category));
    });

    // Attach search event listener
    document.getElementById('projectSearch').addEventListener('input', searchProjects);
    
    // Attach form submission listener
    document.getElementById('projectSubmissionForm').addEventListener('submit', submitProject);
    
    // Attach modal close listener
    document.querySelector('.modal-content .close-btn').addEventListener('click', closeProjectForm);
    
    // Initial filter set
    document.querySelector('.filter-btn[data-category="all"]').click();

    // Animate stats (from other page logic, included for completeness)
    document.querySelectorAll('.stat-number').forEach(stat => {
        const finalValue = stat.textContent;
        stat.textContent = '0';
        
        let current = 0;
        const increment = finalValue.includes('+') ? 10 : 1;
        const target = parseFloat(finalValue);
        
        const timer = setInterval(() => {
            current += increment;
            stat.textContent = current.toFixed(current % 1 === 0 ? 0 : 0) + (finalValue.includes('+') ? '+' : '');
            
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
    if(!firebase.apps.length) {
        console.warn("Firebase not initialized. Cannot load projects from database.");
        return;
    }
    const projectsRef = firebase.database().ref('projects');
    projectsRef.on('value', (snapshot) => {
        const projectsData = snapshot.val();
        if (projectsData) {
            // Convert object to array and filter approved projects
            const approvedProjects = Object.values(projectsData)
                .filter(project => project.status === 'approved');
            
            // You can merge with static projects or replace them
            // For now, we only log it
            console.log('Loaded projects from Firebase (data not merged for demo):', approvedProjects);
        }
    });
}
// loadProjectsFromFirebase(); // Uncomment to fetch from DB