// Ads manager (uses global RealtimeAds API)
document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('adSubmissionForm');
    
    // Check if the form is present (for post-ad.html)
    if(form) {
        form.addEventListener('submit', function(e){
            e.preventDefault();
            
            const title = document.getElementById('adTitle').value;
            const description = document.getElementById('adDescription').value;
            const price = document.getElementById('adPrice').value;
            const imageFile = document.getElementById('adImage').files[0];
            const sellerName = document.getElementById('sellerName').value;
            const sellerEmail = document.getElementById('sellerEmail').value;
            const packageType = document.querySelector('input[name="package"]:checked').value;
            
            const adData = {
                title: title,
                description: description,
                price: price,
                sellerName: sellerName,
                sellerEmail: sellerEmail,
                package: packageType,
                // created, imageUrl, and status will be set by RealtimeAds.saveAd
            };
            
            // Submit ad using RealtimeAds API
            RealtimeAds.saveAd(adData, imageFile).then(function(res){
                alert('Ad posted successfully! It is now pending admin approval.');
                window.location.href = 'marketplace.html';
            }).catch(function(err){ 
                console.error(err); 
                alert('Failed to post ad: ' + (err.message || 'Check console for details.')); 
            });
        });
    }
});

// Admin Ad management logic (for admin.html)
document.addEventListener('DOMContentLoaded', function(){
    if (window.location.href.includes('admin.html')) {
        // The admin.html inline script already contains the core load and delete logic.
        // We will add the update status function here if needed, but for now, 
        // the existing logic in admin.html is sufficient as RealtimeAds is globally available.
        console.log('Admin JS loaded, RealtimeAds available for admin.html.');
    }
});

// Placeholder for saveCampaign if using ads-manager.html for campaign creation
function saveCampaign() {
    alert('Campaign saving logic not implemented in this demo.');
    closeModal('addCampaignModal');
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}