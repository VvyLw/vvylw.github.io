document.querySelectorAll('.intro-img').forEach((img) => {
    img.addEventListener('click', () => {
        const modal = document.getElementById('img-modal');
        modal.classList.add('active');
        modal.querySelector('img').src = this.src;
        modal.querySelector('img').alt = this.alt;
    });
});
document.getElementById('img-modal').addEventListener('click', (e) => this.classList.remove('active'));

const micBar = document.getElementById('micBar');
const percentageText = document.getElementById('percentageText');

const updateGauge = () => {
    const randomPercentage = Math.floor(Math.random() * 101);
    micBar.style.width = randomPercentage + '%';
    percentageText.textContent = randomPercentage + '%';
};

setInterval(updateGauge, 500);
updateGauge();