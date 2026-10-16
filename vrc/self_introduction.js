let backgroundImages = [];

let currentBgIndex = 0;
let activeSlide = 0;
let bgSlides = [];
let backgroundSlideInterval;
let isBackgroundExpanded = false;
let backgroundTransitionVersion = 0;

const hasLangPrefix = () => window.location.pathname.includes('/ja/') || window.location.pathname.includes('/en/');
const getBgPath = (imagePath) => hasLangPrefix() ? `../${imagePath}` : imagePath;
const languageStorageKey = 'selfIntroductionLanguage';

const loadBackgroundImages = async () => {
    const images = [];
    let nextUrl = 'https://api.github.com/repos/VvyLw/vvylw.github.io/contents/vrc/img/bg?per_page=100';

    while (nextUrl) {
        const response = await fetch(nextUrl);
        if (!response.ok) throw new Error(`Background image list request failed: ${response.status}`);

        const entries = await response.json();
        if (!Array.isArray(entries)) throw new Error('Background image list response was invalid.');

        images.push(
            ...entries
                .filter((entry) => entry.type === 'file' && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(entry.name))
                .map((entry) => `img/bg/${entry.name}`)
        );

        const nextLink = response.headers.get('Link')?.match(/<([^>]+)>;\s*rel="next"/);
        nextUrl = nextLink?.[1] ?? null;
    }

    return images;
};

const preloadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.src = src;
});

const getRandomIndex = (exclude) => {
    if (backgroundImages.length === 0) return 0;
    if (backgroundImages.length === 1) return 0;
    let next = Math.floor(Math.random() * backgroundImages.length);
    while (next === exclude) {
        next = Math.floor(Math.random() * backgroundImages.length);
    }
    return next;
};

const showBackgroundSlide = async (nextIndex) => {
    if (!bgSlides.length) return;

    const transitionVersion = backgroundTransitionVersion;
    const nextPath = getBgPath(backgroundImages[nextIndex]);
    await preloadImage(nextPath);
    if (isBackgroundExpanded || transitionVersion !== backgroundTransitionVersion) return;

    const hiddenSlide = bgSlides[activeSlide ^ 1];
    const visibleSlide = bgSlides[activeSlide];

    hiddenSlide.style.backgroundImage = `url('${nextPath}')`;
    hiddenSlide.classList.add('visible');
    visibleSlide.classList.remove('visible');

    activeSlide ^= 1;
    currentBgIndex = nextIndex;
};

const startBackgroundSlideshow = () => {
    clearInterval(backgroundSlideInterval);
    backgroundSlideInterval = setInterval(() => {
        const nextIndex = getRandomIndex(currentBgIndex);
        showBackgroundSlide(nextIndex);
    }, 20000);
};

const setBackgroundExpanded = (expanded) => {
    isBackgroundExpanded = expanded;
    backgroundTransitionVersion++;
    document.body.classList.toggle('background-expanded', expanded);

    if (expanded) {
        clearInterval(backgroundSlideInterval);
    } else {
        startBackgroundSlideshow();
    }
};

const initializeBackgroundSlideshow = async () => {
    backgroundImages = await loadBackgroundImages();
    if (!backgroundImages.length) return;

    const slideshowContainer = document.createElement('div');
    slideshowContainer.className = 'background-slideshow';

    const slideA = document.createElement('div');
    const slideB = document.createElement('div');
    slideA.className = 'bg-slide';
    slideB.className = 'bg-slide';

    slideshowContainer.append(slideA, slideB);
    document.body.prepend(slideshowContainer);

    bgSlides = [slideA, slideB];

    const firstIndex = getRandomIndex(-1);
    const firstPath = getBgPath(backgroundImages[firstIndex]);
    await preloadImage(firstPath);

    slideA.style.backgroundImage = `url('${firstPath}')`;
    slideA.classList.add('visible');
    currentBgIndex = firstIndex;
    activeSlide = 0;
    startBackgroundSlideshow();

    slideshowContainer.addEventListener('click', () => {
        setBackgroundExpanded(!isBackgroundExpanded);
    });
};

// 初回背景設定（画像がある場合）
initializeBackgroundSlideshow().catch((error) => console.error('Could not load background images:', error));

let micGaugeInterval;
let languageRequestInProgress = false;

const syncMicGauge = (language) => {
    clearInterval(micGaugeInterval);
    if (language !== 'ja') {
        const micBar = document.querySelector('.mic-bar');
        if (micBar) micBar.style.width = '3%';
        return;
    }

    const updateGauge = () => {
        const micBar = document.querySelector('.mic-bar');
        if (micBar) micBar.style.width = `${Math.floor(Math.random() * 101)}%`;
    };

    updateGauge();
    micGaugeInterval = setInterval(updateGauge, 100);
};

const captureJapaneseTranslations = () => {
    const translations = Object.fromEntries(
        Array.from(document.querySelectorAll('[data-i18n]'), (element) => [
            element.dataset.i18n,
            element.innerText.trim(),
        ])
    );
    translations.pageTitle = document.title;
    return translations;
};

const applyUnifiedLanguage = (language, translations) => {
    for (const [key, value] of Object.entries(translations)) {
        if (key === 'pageTitle') continue;
        const element = document.querySelector(`[data-i18n="${key}"]`);
        if (!element) throw new Error(`Missing translation target: ${key}`);
        element.textContent = value;
    }

    document.title = translations.pageTitle;
    document.documentElement.lang = language;
};

const loadLegacyLanguage = async (language, updateHistory) => {
    const targetUrl = new URL(window.location.href);
    targetUrl.pathname = targetUrl.pathname.replace(/\/(?:ja|en)\//, `/${language}/`);

    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Language request failed: ${response.status}`);

    const targetDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
    const nextProfile = targetDocument.querySelector('.profile');
    const nextIntroText = targetDocument.querySelector('.intro-text');
    const currentProfile = document.querySelector('.profile');
    const currentIntroText = document.querySelector('.intro-text');

    if (!nextProfile || !nextIntroText || !currentProfile || !currentIntroText) {
        throw new Error('The requested page is missing translated content.');
    }

    currentProfile.replaceWith(nextProfile);
    currentIntroText.replaceWith(nextIntroText);
    document.documentElement.lang = targetDocument.documentElement.lang || language;
    document.title = targetDocument.title;
    syncMicGauge(language);

    if (updateHistory) history.pushState({ language }, '', targetUrl);
};

const loadLanguage = async (language, updateHistory = false) => {
    if (!document.querySelector('[data-i18n]')) {
        return loadLegacyLanguage(language, updateHistory);
    }

    let translations = japaneseTranslations;
    if (language === 'en') {
        const translationsUrl = new URL('self_introduction.en.json', document.baseURI);
        const response = await fetch(translationsUrl);
        if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
        translations = await response.json();
    }

    applyUnifiedLanguage(language, translations);
    syncMicGauge(language);
    sessionStorage.setItem(languageStorageKey, language);

    if (updateHistory) {
        history.pushState(
            { ...history.state, selfIntroductionLanguage: language },
            '',
            window.location.href
        );
    }
};

let japaneseTranslations = {};

document.addEventListener('DOMContentLoaded', () => {
    japaneseTranslations = captureJapaneseTranslations();
    const isUnifiedPage = Boolean(document.querySelector('[data-i18n]'));
    const initialLanguage = isUnifiedPage && sessionStorage.getItem(languageStorageKey) === 'en' ? 'en' : 'ja';
    syncMicGauge(initialLanguage);

    if (isUnifiedPage) {
        history.replaceState(
            { ...history.state, selfIntroductionLanguage: initialLanguage },
            '',
            window.location.href
        );
        if (initialLanguage === 'en') {
            loadLanguage('en').catch((error) => console.error('Could not restore language:', error));
        }
    }

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

    document.addEventListener('click', async (event) => {
        if (!event.target.closest('#switchLang') || languageRequestInProgress) return;

        const language = document.documentElement.lang === 'en' ? 'ja' : 'en';
        languageRequestInProgress = true;
        try {
            await loadLanguage(language, true);
        } catch (error) {
            console.error('Could not switch language:', error);
        } finally {
            languageRequestInProgress = false;
        }
    });

    window.addEventListener('popstate', async (event) => {
        const language = document.querySelector('[data-i18n]')
            ? event.state?.selfIntroductionLanguage
            : window.location.pathname.match(/\/(ja|en)\//)?.[1];
        if (!language || language === document.documentElement.lang || languageRequestInProgress) return;

        languageRequestInProgress = true;
        try {
            await loadLanguage(language);
        } catch (error) {
            console.error('Could not restore language:', error);
        } finally {
            languageRequestInProgress = false;
        }
    });
});