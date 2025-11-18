
function toggleMenu(){
  let nav=document.getElementById("mobileNav");
  nav.style.display = nav.style.display==="flex" ? "none" : "flex";
}
function setTheme(color){
  document.documentElement.style.setProperty('--accent',color);
  localStorage.setItem('accent',color);
}
document.addEventListener("DOMContentLoaded",()=>{
  let saved=localStorage.getItem('accent');
  if(saved) document.documentElement.style.setProperty('--accent',saved);
});
