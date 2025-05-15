let currentIndex = 0;
const items = document.querySelectorAll('.carousel-item');
const totalItems = items.length;

function showNextItem() {
    items[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % totalItems;
    items[currentIndex].classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
    items[currentIndex].classList.add('active'); // Ensure the first item is active
    setInterval(showNextItem, 3000); // Cambia de imagen cada 3 segundos
});
