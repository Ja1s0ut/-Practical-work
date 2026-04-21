lucide.createIcons();

const track = document.getElementById('track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let isAnimating = false; 

nextBtn.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    const card = track.firstElementChild;
    const cardWidth = card.offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap) || 30;

    track.style.transition = "transform 0.4s ease-in-out";
    track.style.transform = `translateX(-${cardWidth + gap}px)`;

    setTimeout(() => {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        track.appendChild(card); 
        isAnimating = false;
    }, 400); 
});

prevBtn.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    const card = track.lastElementChild;
    const cardWidth = track.firstElementChild.offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap) || 30;

    track.prepend(card);
    
    track.style.transition = "none";
    track.style.transform = `translateX(-${cardWidth + gap}px)`;

    setTimeout(() => {
        track.style.transition = "transform 0.4s ease-in-out";
        track.style.transform = "translateX(0)";
    }, 10);

    setTimeout(() => {
        isAnimating = false;
    }, 410);
});

const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', function (e) {
    let core = e.target.value.replace(/\D/g, '');
    
    if (core.length === 0) {
        e.target.value = '';
        return;
    }
    
    if (!core.startsWith('380')) {
        core = '380' + core;
    }
    
    core = core.substring(0, 12);
    
    let match = core.match(/(\d{3})(\d{0,2})(\d{0,3})(\d{0,4})/);
    
    if (match) {
        let formatted = '+' + match[1];
        if (match[2]) formatted += ' ' + match[2];
        if (match[3]) formatted += ' ' + match[3];
        if (match[4]) formatted += ' ' + match[4];
        
        e.target.value = formatted;
    }
});

document.getElementById('scrapForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (phoneInput.value.length !== 16) {
        alert("Будь ласка, введіть повний номер телефону у форматі +380 XX XXX XXXX");
        phoneInput.focus();
        phoneInput.style.borderColor = "red";
        return;
    }
    
    phoneInput.style.borderColor = "#CBD5E1"; 
    
    alert("Дякуємо! Вашу заявку успішно сформовано. Наш менеджер зв'яжеться з вами найближчим часом.");
    
    this.reset(); 
});