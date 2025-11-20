// Small interactions for dashboard
document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.querySelector('#themeToggle');
  if(toggle){
    toggle.addEventListener('click', function(){
      document.documentElement.classList.toggle('alt-theme');
      this.innerText = document.documentElement.classList.contains('alt-theme') ? 'Light' : 'Dark';
    });
  }
  
  // Simple animated counters
  document.querySelectorAll('.count').forEach(el=>{
    const end = +el.dataset.to || 0;
    let cur = 0;
    const step = Math.max(1, Math.floor(end/60));
    const t = setInterval(()=>{
      cur += step;
      if(cur>=end){cur=end; clearInterval(t)}
      el.innerText = cur.toLocaleString();
    }, 20);
  });
});