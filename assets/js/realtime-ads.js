// Realtime Ads API - uses firebase v8 (firebase must be initialized in assets/js/firebase-config.js)
window.RealtimeAds = (function(){
    const storageFolder = "ads-images";

    function uploadImage(file){
        return new Promise((resolve, reject) => {
            if(!file) return resolve('');
            
            // NOTE: This assumes firebase-storage is loaded and initialized.
            // If only firebase-database is loaded, this will fail and jump to reject.
            if (!firebase.storage) {
                console.warn("Firebase Storage is not available. Skipping image upload.");
                // Resolve with a mock image URL or empty string
                return resolve('assets/images/placeholder-ad.png');
            }
            
            const storageRef = firebase.storage().ref(storageFolder + '/' + Date.now() + '_' + file.name);
            const uploadTask = storageRef.put(file);
            uploadTask.on('state_changed', function(){}, function(error){ 
                console.error("Storage upload error:", error);
                reject(error); 
            }, function(){
                uploadTask.snapshot.ref.getDownloadURL().then(function(url){ resolve(url); }).catch(reject);
            });
        });
    }

    function saveAd(adData, imageFile){
        return uploadImage(imageFile).then(function(url){
            const adsRef = firebase.database().ref('ads');
            const newAdRef = adsRef.push();
            const payload = Object.assign({}, adData, { 
                imageUrl: url || '', 
                created: firebase.database.ServerValue.TIMESTAMP,
                status: 'pending' // New ads require admin approval
            });
            return newAdRef.set(payload).then(function(){ return { id: newAdRef.key, ...payload }; });
        });
    }

    function getAllAdsRealtime(onUpdate){
        const adsRef = firebase.database().ref('ads');
        adsRef.on('value', function(snapshot){
            const val = snapshot.val() || {};
            const arr = Object.keys(val).map(k => ({ id: k, ...val[k] }));
            // Filter only approved ads for the public view
            const approvedAds = arr.filter(ad => ad.status === 'approved');
            onUpdate(approvedAds.sort((a,b) => (b.created||0) - (a.created||0)));
        });
        return function unsubscribe(){ adsRef.off(); };
    }

    function fetchAllAdsOnce(){
        // Fetch all ads (including pending) for admin panel
        return firebase.database().ref('ads').once('value').then(snap => { 
            const v = snap.val()||{}; 
            return Object.keys(v).map(k=>({id:k, ...v[k]})).sort((a,b) => (b.created||0)-(a.created||0)); 
        });
    }

    function deleteAd(id){
        return firebase.database().ref('ads/' + id).once('value').then(function(snapshot){
            const ad = snapshot.val();
            
            // delete DB entry
            return firebase.database().ref('ads/' + id).remove().then(function(){
                // delete image from storage if exists and is a storage URL
                if(ad && ad.imageUrl && firebase.storage){
                    try{ 
                        var ref = firebase.storage().refFromURL(ad.imageUrl); 
                        return ref.delete().catch(function(e){ 
                            console.warn('Failed to delete storage file:', e); 
                        }); 
                    }catch(e){ 
                        console.warn('Could not delete storage via ref:', e); 
                    }
                }
            });
        });
    }

    function updateAdStatus(id, status) {
        return firebase.database().ref('ads/' + id).update({ status: status, approvedAt: firebase.database.ServerValue.TIMESTAMP });
    }

    // Public API
    return {
        saveAd,
        getAllAdsRealtime,
        fetchAllAdsOnce,
        deleteAd,
        updateAdStatus
    };
})();