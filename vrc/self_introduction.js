const micBar = document.getElementById('micBar');
const percentageText = document.getElementById('percentageText');

const updateGauge = () => {
    const randomPercentage = Math.floor(Math.random() * 101);
    micBar.style.width = randomPercentage + '%';
    percentageText.textContent = randomPercentage + '%';
};

setInterval(updateGauge, 500);
updateGauge();

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.intro-img').forEach((img) => {
        img.addEventListener('click', () => {
            const modal = document.getElementById('img-modal');
            modal.classList.add('active');
            const modalImg = modal.querySelector('img');
            modalImg.src = img.src;
            modalImg.alt = img.alt;
        });
    });
    document.getElementById('img-modal').addEventListener('click', (e) => e.currentTarget.classList.remove('active'));


    const currentLangElement = document.getElementById('currentLang');
    const switchLangElement = document.getElementById('switchLang');
    
    let currentLanguage = 'ja';
    
    const urls = {
        ja: 'https://vvylw.github.io/vrc/ja/self_introduction.html',
        en: 'https://vvylw.github.io/vrc/en/self_introduction.html'
    };
    
    const updateLanguageDisplay = () => {
        if (currentLanguage === 'ja') {
            currentLangElement.textContent = '日本語';
            switchLangElement.textContent = '英語';
        } else {
            currentLangElement.textContent = 'English';
            switchLangElement.textContent = 'Japanese';
        }
    }
    
    switchLangElement.addEventListener('click', () => {
        if (currentLanguage === 'ja') {
            window.location.href = urls.en;
        } else {
            window.location.href = urls.ja;
        }
    });

    const detectLanguageFromURL = () => {
        const currentURL = window.location.href;
        if (currentURL.includes('/en/')) {
            currentLanguage = 'en';
        } else {
            currentLanguage = 'ja';
        }
    }

    detectLanguageFromURL();
    updateLanguageDisplay();
});