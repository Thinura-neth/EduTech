
document.addEventListener('DOMContentLoaded', function(){
    const container = document.getElementById('adsContainer') || document.querySelector('.ads-grid') || document.body;
    function render(ads){
        container.innerHTML = '';
        if(!ads.length) container.innerHTML = '<p>No ads yet.</p>';
        ads.forEach(ad => {
            const div = document.createElement('div');
            div.className = 'ad-card';
            div.innerHTML = `<div class='ad-img'><img src='${ad.imageUrl||""}' alt=''></div><h3>${ad.title||''}</h3><p>${ad.description||''}</p><strong>${ad.price||''}</strong>`;
            container.appendChild(div);
        });
    }
    RealtimeAds.getAllAdsRealtime(function(ads){ render(ads); });
});
