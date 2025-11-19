
// Ads manager (uses global RealtimeAds API)
document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('postAdForm') || document.querySelector('form');
    if(!form) return;
    form.addEventListener('submit', function(e){
        e.preventDefault();
        const title = document.getElementById('title') ? document.getElementById('title').value : (form.querySelector('[name=title]')||{value:''}).value;
        const description = document.getElementById('description') ? document.getElementById('description').value : (form.querySelector('[name=description]')||{value:''}).value;
        const price = document.getElementById('price') ? document.getElementById('price').value : (form.querySelector('[name=price]')||{value:''}).value;
        const image = document.getElementById('image') ? document.getElementById('image').files[0] : null;
        RealtimeAds.saveAd({title,description,price}, image).then(function(res){
            alert('Ad posted successfully!');
            window.location.href = 'marketplace.html';
        }).catch(function(err){ console.error(err); alert('Failed to post ad: '+err.message); });
    });
});
