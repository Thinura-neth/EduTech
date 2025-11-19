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
