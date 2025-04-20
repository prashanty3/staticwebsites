var menuBarOpen = document.querySelector('.menu-bar');
var menuBarClose = document.querySelector('.menu-close');
var sideBar = document.querySelector('.sidebar');

menuBarOpen.addEventListener('click', function() {
    sideBar.style.left = '0';
    menuBarOpen.style.display = 'none'; 
}); 

menuBarClose.addEventListener('click', function() {
    sideBar.style.left = '-300px';
    menuBarOpen.style.display = 'block';
});