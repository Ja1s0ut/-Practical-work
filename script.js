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
const weightInput = document.getElementById('weight');

phoneInput.addEventListener('input', function (e) {
    let core = e.target.value.replace(/\D/g, '');
    if (core.length === 0) {
        e.target.value = '';
        return;
    }
    if (!core.startsWith('380')) core = '380' + core;
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

weightInput.addEventListener('input', function() {
    if (this.value < 0) {
        this.value = Math.abs(this.value);
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
    
    if (weightInput.value <= 0 || weightInput.value === "") {
        alert("Будь ласка, вкажіть коректну вагу металобрухту.");
        weightInput.focus();
        weightInput.style.borderColor = "red";
        return;
    }
    
    phoneInput.style.borderColor = "#CBD5E1"; 
    weightInput.style.borderColor = "#CBD5E1"; 
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    
    submitBtn.innerText = "Відправка...";
    submitBtn.disabled = true;

    const formData = new URLSearchParams();
    formData.append('company', document.getElementById('company').value);
    formData.append('phone', "'" + document.getElementById('phone').value); 
    formData.append('scrapType', document.getElementById('scrapType').value);
    formData.append('weight', document.getElementById('weight').value);

    const googleAppScriptURL = 'https://script.google.com/macros/s/AKfycbwRzUEiEHqS87NM6_3BJc5hSi6cOp_FvFBLiHfSWV_gF5IeiVYlDP6blupzqfaHY5s_/exec';

    fetch(googleAppScriptURL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    })
    .then(() => {
        alert("Дякуємо! Вашу заявку успішно записано. Наш менеджер зв'яжеться з вами.");
        this.reset(); 
    })
    .catch((error) => {
        console.error('Помилка:', error);
        alert("Сталася помилка при відправці. Спробуйте пізніше.");
    })
    .finally(() => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    });
});
