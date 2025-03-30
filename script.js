// script.js
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.navigation');

    hamburger.addEventListener('click', function() {
        nav.classList.toggle('active');
    });
});