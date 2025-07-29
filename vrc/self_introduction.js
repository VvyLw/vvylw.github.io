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

const micBar = document.getElementById('micBar');
const percentageText = document.getElementById('percentageText');

const updateGauge = () => {
    const randomPercentage = Math.floor(Math.random() * 101);
    micBar.style.width = randomPercentage + '%';
    percentageText.textContent = randomPercentage + '%';
};

setInterval(updateGauge, 500);
updateGauge();