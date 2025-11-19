// assets/js/marketplace.js
class Marketplace {
    constructor() {
        this.ads = [];
        this.init();
    }

    async init() {
        await this.loadAds();
        this.renderAds();
    }

    async loadAds() {
        try {
            // Try to load from Firebase
            this.ads = await clientDB.getUserAds();
        } catch (error) {
            console.error('Error loading ads:', error);
            this.loadAdsFromLocalStorage();
        }
    }

    loadAdsFromLocalStorage() {
        const stored = localStorage.getItem('edutech_user_ads');
        this.ads = stored ? JSON.parse(stored) : [];
    }

    renderAds() {
        const container = document.getElementById('adsGrid');
        
        if (this.ads.length === 0) {
            container.innerHTML = `
                <div class="no-ads" style="text-align: center; padding: 3rem; color: var(--gray); grid-column: 1 / -1;">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No Ads Available</h3>
                    <p>Be the first to post an ad in the marketplace!</p>
                    <a href="post-ad.html" class="btn btn-primary" style="margin-top: 1rem;">Post Your Ad</a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.ads.map(ad => `
            <div class="ad-card">
                <div class="ad-image">
                    ${ad.images && ad.images.length > 0 ? 
                        `<img src="${ad.images[0].data}" alt="${ad.title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        '📦'
                    }
                </div>
                <div class="ad-content">
                    <div class="ad-title">${ad.title}</div>
                    <div class="ad-price">Rs. ${ad.price}</div>
                    <div class="ad-description">${ad.description.substring(0, 100)}${ad.description.length > 100 ? '...' : ''}</div>
                    <div class="ad-meta">
                        <span class="ad-category">${ad.category}</span>
                        <span>${ad.condition}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Global instance
const marketplace = new Marketplace();

// Save user ad function
async function saveUserAd(adData) {
    try {
        return await clientDB.saveUserAd(adData);
    } catch (error) {
        console.error('Error saving ad:', error);
        return false;
    }
}
// assets/js/marketplace.js - Updated version
class Marketplace {
    constructor() {
        this.ads = [];
        this.init();
    }

    async init() {
        await this.loadAds();
        this.renderAds();
        this.setupFilters();
    }

    async loadAds() {
        try {
            // Try to load from Firebase
            this.ads = await clientDB.getUserAds();
        } catch (error) {
            console.error('Error loading ads:', error);
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
    }

    createDemoAds() {
        this.ads = [
            {
                id: 'ad_1',
                title: 'Brand New Laptop',
                category: 'electronics',
                description: 'Dell Inspiron 15, 8GB RAM, 256GB SSD, perfect for students',
                price: '85000',
                condition: 'new',
                package: 'premium',
                sellerName: 'John Doe',
                sellerPhone: '0771234567',
                sellerEmail: 'john@example.com',
                sellerLocation: 'Colombo',
                images: [],
                status: 'approved',
                createdAt: new Date().toISOString(),
                views: 15
            },
            {
                id: 'ad_2',
                title: 'Programming Books Collection',
                category: 'books',
                description: 'Complete set of programming books - JavaScript, Python, Java',
                price: '4500',
                condition: 'used',
                package: 'standard',
                sellerName: 'Jane Smith',
                sellerPhone: '0787654321',
                sellerEmail: 'jane@example.com',
                sellerLocation: 'Kandy',
                images: [],
                status: 'approved',
                createdAt: new Date().toISOString(),
                views: 8
            }
        ];
        this.saveAdsToLocalStorage();
    }

    saveAdsToLocalStorage() {
        localStorage.setItem('edutech_user_ads', JSON.stringify(this.ads));
    }

    renderAds() {
        const container = document.getElementById('adsGrid');
        
        if (this.ads.length === 0) {
            container.innerHTML = `
                <div class="no-ads" style="text-align: center; padding: 3rem; color: var(--gray); grid-column: 1 / -1;">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No Ads Available</h3>
                    <p>Be the first to post an ad in the marketplace!</p>
                    <a href="post-ad.html" class="btn btn-primary" style="margin-top: 1rem;">Post Your Ad</a>
                </div>
            `;
            return;
        }

        // Filter only approved ads
        const approvedAds = this.ads.filter(ad => ad.status === 'approved');
        
        if (approvedAds.length === 0) {
            container.innerHTML = `
                <div class="no-ads" style="text-align: center; padding: 3rem; color: var(--gray); grid-column: 1 / -1;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No Active Ads</h3>
                    <p>All ads are currently under review. Check back later!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = approvedAds.map(ad => `
            <div class="ad-card" data-category="${ad.category}">
                <div class="ad-image">
                    ${ad.images && ad.images.length > 0 ? 
                        `<img src="${ad.images[0].data}" alt="${ad.title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        this.getCategoryIcon(ad.category)
                    }
                </div>
                <div class="ad-content">
                    <div class="ad-header">
                        <div class="ad-title">${ad.title}</div>
                        <div class="ad-price">Rs. ${parseInt(ad.price).toLocaleString()}</div>
                    </div>
                    <div class="ad-description">${ad.description.substring(0, 100)}${ad.description.length > 100 ? '...' : ''}</div>
                    <div class="ad-meta">
                        <span class="ad-category">${this.getCategoryName(ad.category)}</span>
                        <span class="ad-condition">${this.getConditionName(ad.condition)}</span>
                    </div>
                    <div class="ad-footer">
                        <div class="ad-location">
                            <i class="fas fa-map-marker-alt"></i> ${ad.sellerLocation}
                        </div>
                        <div class="ad-views">
                            <i class="fas fa-eye"></i> ${ad.views || 0} views
                        </div>
                    </div>
                    <button class="btn btn-primary btn-small" onclick="viewAd('${ad.id}')" style="width: 100%; margin-top: 1rem;">
                        <i class="fas fa-shopping-cart"></i> Contact Seller
                    </button>
                </div>
            </div>
        `).join('');
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
        return icons[category] || '📦';
    }

    getCategoryName(category) {
        const categories = {
            'electronics': 'Electronics',
            'books': 'Books',
            'furniture': 'Furniture',
            'clothing': 'Clothing',
            'services': 'Services',
            'other': 'Other'
        };
        return categories[category] || category;
    }

    getConditionName(condition) {
        const conditions = {
            'new': 'New',
            'used': 'Used',
            'good': 'Good',
            'fair': 'Fair'
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
        const ads = document.querySelectorAll('.ad-card');
        ads.forEach(ad => {
            if (category === 'all' || ad.getAttribute('data-category') === category) {
                ad.style.display = 'block';
            } else {
                ad.style.display = 'none';
            }
        });
    }

    searchAds(query) {
        const ads = document.querySelectorAll('.ad-card');
        const searchTerm = query.toLowerCase();
        
        ads.forEach(ad => {
            const title = ad.querySelector('.ad-title').textContent.toLowerCase();
            const description = ad.querySelector('.ad-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                ad.style.display = 'block';
            } else {
                ad.style.display = 'none';
            }
        });
    }
}

// Global instance
const marketplace = new Marketplace();

// Save user ad function
async function saveUserAd(adData) {
    try {
        // Add default values
        adData.views = 0;
        adData.status = 'approved'; // Auto-approve for demo
        
        // Save to database
        const success = await clientDB.saveUserAd(adData);
        
        if (success) {
            // Also save to localStorage for immediate display
            const existingAds = JSON.parse(localStorage.getItem('edutech_user_ads') || '[]');
            existingAds.push({
                ...adData,
                id: 'ad_' + Date.now()
            });
            localStorage.setItem('edutech_user_ads', JSON.stringify(existingAds));
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving ad:', error);
        
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

// View ad details
function viewAd(adId) {
    const ads = JSON.parse(localStorage.getItem('edutech_user_ads') || '[]');
    const ad = ads.find(a => a.id === adId);
    
    if (ad) {
        // Show ad details in a modal or redirect to ad details page
        alert(`Contact Seller:\n\nName: ${ad.sellerName}\nPhone: ${ad.sellerPhone}\nEmail: ${ad.sellerEmail}\nLocation: ${ad.sellerLocation}\n\nItem: ${ad.title}\nPrice: Rs. ${ad.price}\n\nDescription: ${ad.description}`);
        
        // Increment view count
        ad.views = (ad.views || 0) + 1;
        localStorage.setItem('edutech_user_ads', JSON.stringify(ads));
    }
}
