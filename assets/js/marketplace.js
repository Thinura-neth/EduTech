// assets/js/marketplace.js - Complete Marketplace System
class Marketplace {
    constructor() {
        this.ads = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.init();
    }

    async init() {
        console.log('🛍️ Marketplace initializing...');
        await this.loadAds();
        this.renderAds();
        this.setupFilters();
        this.updateStats();
    }

    async loadAds() {
        try {
            // Try to load from Firebase first
            if (typeof clientDB !== 'undefined' && clientDB.initialized) {
                this.ads = await clientDB.getUserAds();
                console.log('✅ Loaded ads from Firebase:', this.ads.length);
            } else {
                throw new Error('Firebase not available');
            }
        } catch (error) {
            console.log('⚠️ Falling back to localStorage');
            this.loadAdsFromLocalStorage();
        }
    }

    loadAdsFromLocalStorage() {
        const stored = localStorage.getItem('edutech_user_ads');
        this.ads = stored ? JSON.parse(stored) : [];
        
        // If no ads in localStorage, create some demo ads
        if (this.ads.length === 0) {
            this.createDemoAds();
        }
        console.log('✅ Loaded ads from localStorage:', this.ads.length);
    }

    createDemoAds() {
        this.ads = [
            {
                id: 'ad_1',
                title: 'Brand New Laptop - Dell Inspiron',
                category: 'electronics',
                description: 'Dell Inspiron 15, 8GB RAM, 256GB SSD, Intel i5 processor. Perfect for programming students. Includes original box and accessories.',
                price: '85000',
                condition: 'new',
                package: 'premium',
                sellerName: 'John Doe',
                sellerPhone: '0771234567',
                sellerEmail: 'john@example.com',
                sellerLocation: 'Colombo',
                images: [],
                status: 'approved',
                createdAt: new Date('2024-01-15').toISOString(),
                views: 23
            },
            {
                id: 'ad_2',
                title: 'Programming Books Collection',
                category: 'books',
                description: 'Complete set of programming books: JavaScript: The Good Parts, Python Crash Course, Clean Code, and Data Structures & Algorithms. All in excellent condition.',
                price: '4500',
                condition: 'used',
                package: 'standard',
                sellerName: 'Jane Smith',
                sellerPhone: '0787654321',
                sellerEmail: 'jane@example.com',
                sellerLocation: 'Kandy',
                images: [],
                status: 'approved',
                createdAt: new Date('2024-01-10').toISOString(),
                views: 15
            },
            {
                id: 'ad_3',
                title: 'Study Desk and Chair Set',
                category: 'furniture',
                description: 'Wooden study desk with matching chair. Perfect for home office or student room. Good condition, minor scratches.',
                price: '12000',
                condition: 'good',
                package: 'basic',
                sellerName: 'David Wilson',
                sellerPhone: '0765554444',
                sellerEmail: 'david@example.com',
                sellerLocation: 'Gampaha',
                images: [],
                status: 'approved',
                createdAt: new Date('2024-01-08').toISOString(),
                views: 31
            },
            {
                id: 'ad_4',
                title: 'Graphic Calculator - CASIO fx-9750GII',
                category: 'electronics',
                description: 'CASIO fx-9750GII graphic calculator. Perfect for engineering and math students. Includes user manual and carrying case.',
                price: '8000',
                condition: 'used',
                package: 'standard',
                sellerName: 'Sarah Johnson',
                sellerPhone: '0778889999',
                sellerEmail: 'sarah@example.com',
                sellerLocation: 'Negombo',
                images: [],
                status: 'approved',
                createdAt: new Date('2024-01-05').toISOString(),
                views: 18
            }
        ];
        this.saveAdsToLocalStorage();
    }

    saveAdsToLocalStorage() {
        localStorage.setItem('edutech_user_ads', JSON.stringify(this.ads));
    }

    renderAds() {
        const container = document.getElementById('adsGrid');
        if (!container) return;

        // Filter ads based on current filter and search
        let filteredAds = this.ads.filter(ad => ad.status === 'approved');
        
        if (this.currentFilter !== 'all') {
            filteredAds = filteredAds.filter(ad => ad.category === this.currentFilter);
        }
        
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredAds = filteredAds.filter(ad => 
                ad.title.toLowerCase().includes(query) ||
                ad.description.toLowerCase().includes(query) ||
                ad.sellerLocation.toLowerCase().includes(query)
            );
        }

        if (filteredAds.length === 0) {
            container.innerHTML = this.getNoAdsHTML();
            return;
        }

        // Sort by creation date (newest first)
        filteredAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = filteredAds.map(ad => this.getAdCardHTML(ad)).join('');
    }

    getNoAdsHTML() {
        if (this.searchQuery || this.currentFilter !== 'all') {
            return `
                <div class="no-ads" style="text-align: center; padding: 3rem; color: var(--gray); grid-column: 1 / -1;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No Ads Found</h3>
                    <p>Try changing your search or filter criteria</p>
                    <button class="btn btn-secondary" onclick="marketplace.clearFilters()" style="margin-top: 1rem;">
                        Clear Filters
                    </button>
                </div>
            `;
        }

        return `
            <div class="no-ads" style="text-align: center; padding: 3rem; color: var(--gray); grid-column: 1 / -1;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No Ads Available</h3>
                <p>Be the first to post an ad in the marketplace!</p>
                <a href="../../post-ad.html" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i> Post Your Ad
                </a>
            </div>
        `;
    }

    getAdCardHTML(ad) {
        const timeAgo = this.getTimeAgo(ad.createdAt);
        
        return `
            <div class="ad-card" data-category="${ad.category}">
                <div class="ad-image">
                    ${this.getCategoryIcon(ad.category)}
                    ${ad.package !== 'basic' ? `<div class="ad-badge ${ad.package}">${ad.package}</div>` : ''}
                </div>
                <div class="ad-content">
                    <div class="ad-header">
                        <div class="ad-title">${ad.title}</div>
                        <div class="ad-price">Rs. ${parseInt(ad.price).toLocaleString()}</div>
                    </div>
                    <div class="ad-description">${ad.description}</div>
                    <div class="ad-meta">
                        <span class="ad-category">${this.getCategoryName(ad.category)}</span>
                        <span class="ad-condition">${this.getConditionName(ad.condition)}</span>
                    </div>
                    <div class="ad-footer">
                        <div class="ad-location">
                            <i class="fas fa-map-marker-alt"></i> ${ad.sellerLocation}
                        </div>
                        <div class="ad-info">
                            <span class="ad-views">
                                <i class="fas fa-eye"></i> ${ad.views || 0}
                            </span>
                            <span class="ad-time">${timeAgo}</span>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-small view-ad-btn" onclick="marketplace.viewAd('${ad.id}')">
                        <i class="fas fa-shopping-cart"></i> Contact Seller
                    </button>
                </div>
            </div>
        `;
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    getCategoryIcon(category) {
        const icons = {
            'electronics': '💻',
            'books': '📚',
            'furniture': '🪑',
            'clothing': '👕',
            'services': '🔧',
            'other': '📦'
        };
        return `<div class="category-icon">${icons[category] || '📦'}</div>`;
    }

    getCategoryName(category) {
        const categories = {
            'electronics': 'Electronics',
            'books': 'Books & Stationery',
            'furniture': 'Furniture',
            'clothing': 'Clothing',
            'services': 'Services',
            'other': 'Other'
        };
        return categories[category] || category;
    }

    getConditionName(condition) {
        const conditions = {
            'new': 'Brand New',
            'used': 'Used - Like New',
            'good': 'Used - Good',
            'fair': 'Used - Fair'
        };
        return conditions[condition] || condition;
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('searchInput');
        
        if (filterButtons) {
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filter = button.getAttribute('data-filter');
                    this.filterAds(filter);
                    
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchAds(e.target.value);
            });
        }
    }

    filterAds(category) {
        this.currentFilter = category;
        this.renderAds();
        this.updateStats();
    }

    searchAds(query) {
        this.searchQuery = query;
        this.renderAds();
        this.updateStats();
    }

    clearFilters() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        
        // Reset UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]').classList.add('active');
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        this.renderAds();
        this.updateStats();
    }

    updateStats() {
        const totalAds = this.ads.filter(ad => ad.status === 'approved').length;
        const filteredAds = this.getFilteredAds().length;
        
        // Update stats display if exists
        const statsElement = document.getElementById('marketplaceStats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
                    <div class="stat-item">
                        <div class="stat-number">${totalAds}</div>
                        <div class="stat-label">Total Ads</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${filteredAds}</div>
                        <div class="stat-label">Showing</div>
                    </div>
                </div>
            `;
        }
    }

    getFilteredAds() {
        let filteredAds = this.ads.filter(ad => ad.status === 'approved');
        
        if (this.currentFilter !== 'all') {
            filteredAds = filteredAds.filter(ad => ad.category === this.currentFilter);
        }
        
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredAds = filteredAds.filter(ad => 
                ad.title.toLowerCase().includes(query) ||
                ad.description.toLowerCase().includes(query) ||
                ad.sellerLocation.toLowerCase().includes(query)
            );
        }
        
        return filteredAds;
    }

    async viewAd(adId) {
        const ad = this.ads.find(a => a.id === adId);
        
        if (ad) {
            // Increment view count
            ad.views = (ad.views || 0) + 1;
            this.saveAdsToLocalStorage();
            
            // Show ad details modal
            this.showAdModal(ad);
        }
    }

    showAdModal(ad) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="adModal" style="display: block;">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>${ad.title}</h2>
                        <span class="close-modal" onclick="marketplace.closeModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="ad-details">
                            <div class="detail-section">
                                <div class="detail-price">Rs. ${parseInt(ad.price).toLocaleString()}</div>
                                <div class="detail-meta">
                                    <span class="category-badge">${this.getCategoryName(ad.category)}</span>
                                    <span class="condition-badge">${this.getConditionName(ad.condition)}</span>
                                    ${ad.package !== 'basic' ? `<span class="package-badge ${ad.package}">${ad.package}</span>` : ''}
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Description</h4>
                                <p>${ad.description}</p>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Seller Information</h4>
                                <div class="seller-info">
                                    <div class="info-item">
                                        <i class="fas fa-user"></i>
                                        <span>${ad.sellerName}</span>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-phone"></i>
                                        <span>${ad.sellerPhone}</span>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-envelope"></i>
                                        <span>${ad.sellerEmail}</span>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${ad.sellerLocation}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Ad Statistics</h4>
                                <div class="ad-stats">
                                    <div class="stat">
                                        <i class="fas fa-eye"></i>
                                        <span>${ad.views || 0} views</span>
                                    </div>
                                    <div class="stat">
                                        <i class="fas fa-calendar"></i>
                                        <span>Posted ${this.getTimeAgo(ad.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="marketplace.closeModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                        <button class="btn btn-primary" onclick="marketplace.contactSeller('${ad.sellerPhone}', '${ad.sellerName}')">
                            <i class="fas fa-phone"></i> Call Seller
                        </button>
                        <button class="btn btn-success" onclick="marketplace.sendMessage('${ad.sellerPhone}', '${ad.title}')">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeModal() {
        const modal = document.getElementById('adModal');
        if (modal) {
            modal.remove();
        }
    }

    contactSeller(phone, name) {
        if (confirm(`Call ${name} at ${phone}?`)) {
            window.open(`tel:${phone}`, '_self');
        }
    }

    sendMessage(phone, itemTitle) {
        const message = `Hello! I'm interested in your item: ${itemTitle}. Is it still available?`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/94${phone.substring(1)}?text=${encodedMessage}`, '_blank');
    }

    // Refresh marketplace data
    async refresh() {
        await this.loadAds();
        this.renderAds();
        this.updateStats();
    }
}

// Global instance
const marketplace = new Marketplace();

// Save user ad function
async function saveUserAd(adData) {
    try {
        // Add default values
        const adId = 'ad_' + Date.now();
        const completeAdData = {
            ...adData,
            id: adId,
            views: 0,
            status: 'approved' // Auto-approve for demo
        };

        let success = false;
        
        // Try to save to Firebase first
        if (typeof clientDB !== 'undefined' && clientDB.initialized) {
            success = await clientDB.saveUserAd(completeAdData);
        }

        // Always save to localStorage for immediate display
        const existingAds = JSON.parse(localStorage.getItem('edutech_user_ads') || '[]');
        existingAds.push(completeAdData);
        localStorage.setItem('edutech_user_ads', JSON.stringify(existingAds));
        
        console.log('✅ Ad saved successfully:', completeAdData);
        return true;
        
    } catch (error) {
        console.error('❌ Error saving ad:', error);
        
        // Fallback to localStorage only
        const existingAds = JSON.parse(localStorage.getItem('edutech_user_ads') || '[]');
        existingAds.push({
            ...adData,
            id: 'ad_' + Date.now(),
            views: 0,
            status: 'approved'
        });
        localStorage.setItem('edutech_user_ads', JSON.stringify(existingAds));
        
        return true;
    }
}

// Initialize marketplace when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Marketplace will auto-initialize through its constructor
    console.log('🛍️ Marketplace system ready');
});
