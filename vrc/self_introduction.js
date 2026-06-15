const backgroundImages = [
    'img/bg/Binah_Inverted_BackGround.webp',
    'img/bg/Binah_Inverted_BackGround2.webp',
    'img/bg/Binah_Inverted_BackGround3.webp',
    'img/bg/Binah_Inverted_BackGround4.webp',
    'img/bg/Binah_Inverted_BackGround5.webp',
    'img/bg/Binah_Inverted_BackGround6.webp',
    'img/bg/Binah_Inverted_BackGround7.webp',
    'img/bg/Binah_Inverted_BackGround8.webp',
    'img/bg/Binah_Inverted_BackGround9.webp',
    'img/bg/Binah_Lite.webp',
    'img/bg/Binah_Wizard.webp',
    'img/bg/Kumaly_Enthusiast.webp',
    'img/bg/Kumaly_KawaiiFutureBass2_2p.webp.webp',
    'img/bg/Kumaly_KawaiiFutureBass_1p.webp',
    'img/bg/Kumaly_KawaiiFutureBass_2p.webp',
    'img/bg/Mafuyu_For.webp',
    'img/bg/Moe_Magician.webp',
    'img/bg/Retinia_Vagabond.webp',
    'img/bg/Retinia_Vagabond2.webp',
    'img/bg/Retinia_Vagabond3.webp',
    'img/bg/Retinia_Vagabond4.webp',
    'img/bg/Retinia_Vagabond5.webp',
    'img/bg/Retinia_Vagabond_and_Mafuyu_For.webp',
    'img/bg/friends.webp',
    'img/bg/with_EndReached.webp',
    'img/bg/with_Eto.webp',
    'img/bg/with_Eto2.webp',
    'img/bg/with_Lintyan_and_Izumi.webp',
    'img/bg/with_SLEEP.webp',
    'img/bg/with_SLEEP2.webp',
    'img/bg/with_nacha.webp',
    'img/bg/with_nacha2.webp',
    'img/bg/with_tAKa_ENe.webp',
    'img/bg/with_tAKa_ENe10.webp',
    'img/bg/with_tAKa_ENe11.webp',
    'img/bg/with_tAKa_ENe12.webp',
    'img/bg/with_tAKa_ENe13.webp',
    'img/bg/with_tAKa_ENe14.webp',
    'img/bg/with_tAKa_ENe15.webp',
    'img/bg/with_tAKa_ENe2.webp',
    'img/bg/with_tAKa_ENe3.webp',
    'img/bg/with_tAKa_ENe4.webp',
    'img/bg/with_tAKa_ENe5.webp',
    'img/bg/with_tAKa_ENe6.webp',
    'img/bg/with_tAKa_ENe7.webp',
    'img/bg/with_tAKa_ENe8.webp',
    'img/bg/with_tAKa_ENe9.webp',
    'img/bg/with_touffucha.webp',
];

let currentBgIndex = 0;

const rotateBackground = () => {
    if (backgroundImages.length === 0) return;
    
    const bgPath = window.location.pathname.includes('/ja/') || window.location.pathname.includes('/en/')
        ? '../' + backgroundImages[currentBgIndex]
        : backgroundImages[currentBgIndex];
    
    document.body.style.backgroundImage = `url('${bgPath}')`;
    currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
};

// 初回背景設定（画像がある場合）
if (backgroundImages.some(img => img)) {
    rotateBackground();
}

// 20秒置きに背景を切り替え
setInterval(rotateBackground, 20000);

if(window.location.pathname.includes('/ja/')) {
    const micBar = document.getElementById('micBar');

    const updateGauge = () => {
        const randomPercentage = Math.floor(Math.random() * 101);
        micBar.style.width = randomPercentage + '%';
    };

    setInterval(updateGauge, 100);
    updateGauge();
}

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