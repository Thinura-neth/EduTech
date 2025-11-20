// Marketplace rendering logic (uses global RealtimeAds API)
const marketplace = (function(){
    const container = document.getElementById('adsContainer') || document.querySelector('.ads-grid') || document.body;
    let unsubscribe = null;

    function render(ads){
        const loadingDiv = document.getElementById('loadingAds');
        if (loadingDiv) loadingDiv.style.display = 'none';

        container.innerHTML = '';
        if(!ads.length) {
            container.innerHTML = '<p class="text-center text-muted">No approved ads found yet.</p>';
            return;
        }

        ads.forEach(ad => {
            const div = document.createElement('div');
            div.className = 'ad-card';
            div.innerHTML = `
                <div class='ad-img'>
                    <img src='${ad.imageUrl || "assets/images/placeholder-ad.png"}' alt='${ad.title||'Ad Image'}' onerror="this.onerror=null;this.src='assets/images/placeholder-ad.png';">
                </div>
                <div class="ad-content">
                    <h3>${ad.title||'No Title'}</h3>
                    <p>${ad.description||'No description provided.'}</p>
                    <div class="ad-footer">
                        <strong class="ad-price">${ad.price||'Negotiable'}</strong>
                        <a href="contact.html" class="btn btn-small">Contact Seller</a>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    function initRealtimeListener() {
        if (typeof RealtimeAds === 'undefined' || !firebase.database) {
            console.error('RealtimeAds API or Firebase Database is not available.');
            container.innerHTML = '<p class="text-center text-error">Ad service is temporarily unavailable.</p>';
            return;
        }
        
        // Remove previous listener if exists
        if (unsubscribe) unsubscribe();

        // Start new listener for approved ads
        unsubscribe = RealtimeAds.getAllAdsRealtime(function(ads){ 
            console.log('Realtime update received:', ads.length, 'approved ads.');
            render(ads); 
        });
        console.log('✅ Realtime Ads listener started.');
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', initRealtimeListener);

    // Public method to manually refresh (primarily useful for admin changes)
    function refresh() {
        // Just re-run the listener setup, which handles unsubscription and re-listening
        initRealtimeListener();
    }

    // Return public interface
    return {
        refresh: refresh
    };

})();