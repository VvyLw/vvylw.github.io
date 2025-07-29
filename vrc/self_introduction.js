const micBar = document.getElementById('micBar');
const percentageText = document.getElementById('percentageText');

const updateGauge = () => {
    const randomPercentage = Math.floor(Math.random() * 101);
    micBar.style.width = randomPercentage + '%';
};

setInterval(updateGauge, 100);
updateGauge();

const urls = {
    ja: 'https://vvylw.github.io/vrc/ja/self_introduction.html',
    en: 'https://vvylw.github.io/vrc/en/self_introduction.html'
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.intro-img').forEach((img) => {
        img.addEventListener('click', () => {
            const modal = document.getElementById('img-modal');
            modal.classList.add('active');
            const modalContent = modal.querySelector('.modal-content');
            const modalImg = modalContent.querySelector('img');
            const avatarNameDiv = modalContent.querySelector('.avatar-name');
            modalImg.src = img.src;
            modalImg.alt = img.alt;
            const avatarName = img.getAttribute('data-avatar-name');
            avatarNameDiv.textContent = avatarName;
        });
    });
    document.getElementById('img-modal').addEventListener('click', (e) => e.currentTarget.classList.remove('active'));

    const switchLangElement = document.getElementById('switchLang');
    
    switchLangElement.addEventListener('click', () => {
        const currentURL = window.location.href;
        if (currentURL.includes('/en/')) {
            window.location.href = urls.ja;
        } else {
            window.location.href = urls.en;
        }
    });
});