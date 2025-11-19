// Realtime Ads API - uses firebase v8 (firebase must be initialized in assets/js/firebase-config.js)
window.RealtimeAds = (function(){
    const storageFolder = "ads-images";

    function uploadImage(file){
        return new Promise((resolve, reject) => {
            if(!file) return resolve('');
            const storageRef = firebase.storage().ref(storageFolder + '/' + Date.now() + '_' + file.name);
            const uploadTask = storageRef.put(file);
            uploadTask.on('state_changed', function(){}, function(error){ reject(error); }, function(){
                uploadTask.snapshot.ref.getDownloadURL().then(function(url){ resolve(url); }).catch(reject);
            });
        });
    }

    function saveAd(adData, imageFile){
        return uploadImage(imageFile).then(function(url){
            const adsRef = firebase.database().ref('ads');
            const newAdRef = adsRef.push();
            const payload = Object.assign({}, adData, { imageUrl: url || '', created: firebase.database.ServerValue.TIMESTAMP });
            return newAdRef.set(payload).then(function(){ return { id: newAdRef.key, ...payload }; });
        });
    }

    function getAllAdsRealtime(onUpdate){
        const adsRef = firebase.database().ref('ads');
        adsRef.on('value', function(snapshot){
            const val = snapshot.val() || {};
            const arr = Object.keys(val).map(k => ({ id: k, ...val[k] }));
            onUpdate(arr.sort((a,b) => (b.created||0) - (a.created||0)));
        });
        return function unsubscribe(){ adsRef.off(); };
    }

    function fetchAllAdsOnce(){
        return firebase.database().ref('ads').once('value').then(snap => { const v = snap.val()||{}; return Object.keys(v).map(k=>({id:k, ...v[k]})).sort((a,b) => (b.created||0)-(a.created||0)); });
    }

    function deleteAd(id){
        return firebase.database().ref('ads/' + id).once('value').then(function(snapshot){
            const ad = snapshot.val();
            // delete DB entry
            return firebase.database().ref('ads/' + id).remove().then(function(){
                // delete image from storage if exists and is a storage URL
                if(ad && ad.imageUrl){
                    try{ var ref = firebase.storage().refFromURL(ad.imageUrl); return ref.delete().catch(function(e){ console.warn('Failed to delete storage file:', e); }); }catch(e){ console.warn('Could not delete storage via refFromURL:', e); }
                }
            });
        });
    }

    return { saveAd, getAllAdsRealtime, fetchAllAdsOnce, deleteAd };
})();
