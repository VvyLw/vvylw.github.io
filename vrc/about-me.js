const translationsUrl = new URL('about-me_en.json', document.baseURI);
const languagePreferenceKey = 'aboutMeLanguage';
const switchButton = document.getElementById('switchLang');
const languageError = document.getElementById('languageError');
const imageDialog = document.querySelector('.image-dialog');
const backgroundLayers = Array.from(document.querySelectorAll('.ambient-image'));
const backgroundViewer = document.querySelector('.ambient-background');
const profileCard = document.querySelector('.profile-card');
const voiceMeter = document.querySelector('.voice-meter');
const voiceTrack = document.querySelector('.voice-track');
const voiceValue = document.querySelector('.voice-value');
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const voiceGaugeIntervalMs = 333;
const voiceGaugeAnimationDuration = 333;
const voiceLanguageTransitionDuration = 333;
const japaneseTranslations = Object.fromEntries(
    Array.from(document.querySelectorAll('[data-i18n]'), (element) => [
        element.dataset.i18n,
        element.textContent.trim(),
    ])
);
japaneseTranslations.pageTitle = document.title;
japaneseTranslations.heroTitle = document.querySelector('[data-i18n="heroTitle"]').dataset.jaTitle;

let englishTranslations;
let languageRequestInProgress = false;
let activeBackgroundLayer = 0;
let currentBackgroundIndex = -1;
let voiceAnimationFrame = 0;
let voiceGaugeInterval;
let voiceGaugeStartTimeout;
let heroAnimationFrame = 0;
let heroTransitionAnimations = [];
let heroAnimationGeneration = 0;
let backgroundScrollPosition = 0;
let backgroundSlideshowInterval;
let backgroundChangeGeneration = 0;

let backgroundImages = [];

const updateProfileStickyOffset = () => {
    profileCard.style.setProperty('--profile-card-height', `${profileCard.offsetHeight}px`);
};

if ('ResizeObserver' in window) {
    new ResizeObserver(updateProfileStickyOffset).observe(profileCard);
} else {
    window.addEventListener('resize', updateProfileStickyOffset);
    updateProfileStickyOffset();
}

const loadBackgroundImages = async () => {
    const images = [];
    let nextUrl = 'https://api.github.com/repos/VvyLw/vvylw.github.io/contents/vrc/img/bg?per_page=100';

    while (nextUrl) {
        const response = await fetch(nextUrl);
        if (!response.ok) {
            throw new Error(`Background image list request failed: ${response.status}`);
        }

        const entries = await response.json();
        if (!Array.isArray(entries)) {
            throw new Error('Background image list response was invalid.');
        }

        images.push(
            ...entries
                .filter((entry) => entry.type === 'file' && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(entry.name))
                .map((entry) => entry.name)
        );

        const nextLink = response.headers.get('Link')?.match(/<([^>]+)>;\s*rel="next"/);
        nextUrl = nextLink?.[1] ?? null;
    }

    if (!images.length) {
        throw new Error('No background images were found in the repository folder.');
    }

    return images;
};

const preloadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Background image could not be loaded: ${src}`));
    image.src = src;
});

const getNextBackgroundIndex = () => {
    if (backgroundImages.length === 1) return 0;
    let nextIndex = Math.floor(Math.random() * backgroundImages.length);
    while (nextIndex === currentBackgroundIndex) {
        nextIndex = Math.floor(Math.random() * backgroundImages.length);
    }
    return nextIndex;
};

const showRandomBackground = async () => {
    if (!backgroundLayers.length || document.body.classList.contains('background-expanded')) return;

    const generation = backgroundChangeGeneration;
    const nextIndex = getNextBackgroundIndex();
    const imageUrl = `img/bg/${encodeURIComponent(backgroundImages[nextIndex])}`;
    await preloadImage(imageUrl);

    if (generation !== backgroundChangeGeneration || document.body.classList.contains('background-expanded')) return;

    const nextLayerIndex = activeBackgroundLayer ^ 1;
    const nextLayer = backgroundLayers[nextLayerIndex];
    nextLayer.style.backgroundImage = `url("${imageUrl}")`;
    nextLayer.classList.add('visible');
    backgroundLayers[activeBackgroundLayer].classList.remove('visible');
    activeBackgroundLayer = nextLayerIndex;
    currentBackgroundIndex = nextIndex;
};

const startBackgroundSlideshow = () => {
    if (backgroundSlideshowInterval || document.body.classList.contains('background-expanded')) return;

    backgroundSlideshowInterval = window.setInterval(() => {
        showRandomBackground().catch((error) => {
            console.error('Could not change background image:', error);
        });
    }, 20000);
};

const stopBackgroundSlideshow = () => {
    window.clearInterval(backgroundSlideshowInterval);
    backgroundSlideshowInterval = undefined;
    backgroundChangeGeneration += 1;
};

const initializeBackgroundSlideshow = async () => {
    backgroundImages = await loadBackgroundImages();
    await showRandomBackground();
    startBackgroundSlideshow();
};

const animateVoiceGauge = (percentage, languageTransition = false) => {
    window.cancelAnimationFrame(voiceAnimationFrame);
    voiceMeter.classList.toggle('voice-language-transition', languageTransition);
    if (languageTransition) {
        void voiceMeter.offsetWidth;
    }
    voiceMeter.style.width = `${percentage}%`;
    voiceTrack.setAttribute('aria-valuenow', String(percentage));

    const startValue = Number.parseInt(voiceValue.textContent, 10) || 0;
    const startedAt = performance.now();
    const duration = languageTransition ? voiceLanguageTransitionDuration : voiceGaugeAnimationDuration;

    const animateValue = (timestamp) => {
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const currentValue = Math.round(startValue + (percentage - startValue) * easedProgress);
        voiceValue.textContent = `${currentValue}%`;

        if (progress < 1) {
            voiceAnimationFrame = window.requestAnimationFrame(animateValue);
        } else if (languageTransition) {
            voiceMeter.classList.remove('voice-language-transition');
        }
    };

    voiceAnimationFrame = window.requestAnimationFrame(animateValue);
};

const updateVoiceGauge = () => {
    animateVoiceGauge(Math.floor(Math.random() * 101));
};

const initializeVoiceGauge = () => {
    setVoiceGaugeLanguage(document.documentElement.lang);
};

const setVoiceGaugeLanguage = (language) => {
    window.clearInterval(voiceGaugeInterval);
    window.clearTimeout(voiceGaugeStartTimeout);
    window.cancelAnimationFrame(voiceAnimationFrame);

    if (language === 'en') {
        animateVoiceGauge(1, true);
        return;
    }

    animateVoiceGauge(Math.floor(Math.random() * 101), true);
    voiceGaugeStartTimeout = window.setTimeout(() => {
        voiceGaugeInterval = window.setInterval(updateVoiceGauge, voiceGaugeIntervalMs);
    }, voiceLanguageTransitionDuration);
};

const applyTranslations = (translations, language) => {
    for (const [key, value] of Object.entries(translations)) {
        if (key === 'pageTitle') continue;

        const targets = document.querySelectorAll(`[data-i18n="${key}"]`);
        if (!targets.length) {
            throw new Error(`Missing translation target: ${key}`);
        }
        targets.forEach((target) => {
            target.textContent = value;
        });
    }

    const heroTitle = document.querySelector('[data-i18n="heroTitle"]');
    heroTitle.setAttribute('aria-label', translations.heroTitle ?? heroTitle.dataset.jaTitle);
    document.querySelectorAll('.profile-tag').forEach((tag) => {
        tag.hidden = language !== 'en';
    });
    document.documentElement.lang = language;
    if (translations.pageTitle) document.title = translations.pageTitle;
    setVoiceGaugeLanguage(language);
};

const loadEnglishTranslations = async () => {
    if (englishTranslations) return englishTranslations;

    const response = await fetch(translationsUrl);
    if (!response.ok) {
        throw new Error(`Translation request failed: ${response.status}`);
    }

    const translations = await response.json();
    if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
        throw new Error('Translation data must be a JSON object.');
    }
    englishTranslations = translations;
    return englishTranslations;
};

const showLanguagePreferenceError = () => {
    languageError.textContent = document.documentElement.lang === 'en'
        ? 'Your language preference could not be saved in this browser.'
        : '言語設定をこのブラウザーに保存できませんでした。';
};

const restoreSavedLanguage = async () => {
    let savedLanguage;
    try {
        savedLanguage = window.localStorage.getItem(languagePreferenceKey);
    } catch (error) {
        console.error('Could not read saved language preference:', error);
        showLanguagePreferenceError();
        return;
    }

    if (savedLanguage !== 'en' || document.documentElement.lang === savedLanguage) return;

    try {
        applyTranslations(await loadEnglishTranslations(), 'en');
    } catch (error) {
        console.error('Could not restore saved language:', error);
        languageError.textContent = '英語データを読み込めませんでした。ページを配信環境で開いて、もう一度お試しください。';
    }
};

switchButton.addEventListener('click', async () => {
    if (languageRequestInProgress) return;

    languageRequestInProgress = true;
    languageError.textContent = '';
    switchButton.disabled = true;

    try {
        const switchingToEnglish = document.documentElement.lang !== 'en';
        if (switchingToEnglish) {
            applyTranslations(await loadEnglishTranslations(), 'en');
        } else {
            applyTranslations(japaneseTranslations, 'ja');
        }
        try {
            window.localStorage.setItem(languagePreferenceKey, document.documentElement.lang);
        } catch (error) {
            console.error('Could not save language preference:', error);
            showLanguagePreferenceError();
        }
    } catch (error) {
        console.error('Could not switch language:', error);
        languageError.textContent = document.documentElement.lang === 'en'
            ? 'Could not load English text. Please open this page from a web server and try again.'
            : '英語データを読み込めませんでした。ページを配信環境で開いて、もう一度お試しください。';
    } finally {
        languageRequestInProgress = false;
        switchButton.disabled = false;
    }
});

document.querySelectorAll('.avatar-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
        const image = tile.querySelector('img');
        const dialogImage = imageDialog.querySelector('img');
        dialogImage.src = image.currentSrc || image.src;
        dialogImage.alt = image.alt;
        imageDialog.querySelector('.dialog-caption').textContent = image.alt;
        imageDialog.showModal();
    });
});

imageDialog.querySelector('.dialog-close').addEventListener('click', () => {
    imageDialog.close();
});

imageDialog.addEventListener('click', (event) => {
    if (event.target === imageDialog) imageDialog.close();
});

const setBackgroundExpanded = (expanded) => {
    if (expanded) {
        backgroundScrollPosition = window.scrollY;
        stopBackgroundSlideshow();
    }

    document.body.classList.toggle('background-expanded', expanded);
    backgroundViewer.setAttribute(
        'aria-label',
        expanded ? '背景画像の全体表示を閉じる' : '背景画像を全体表示'
    );
    backgroundViewer.setAttribute('aria-expanded', String(expanded));

    if (expanded) {
        return;
    }

    startBackgroundSlideshow();
    window.requestAnimationFrame(() => {
        window.scrollTo(0, backgroundScrollPosition);
    });
};

backgroundViewer.addEventListener('click', () => {
    setBackgroundExpanded(!document.body.classList.contains('background-expanded'));
});

backgroundViewer.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setBackgroundExpanded(!document.body.classList.contains('background-expanded'));
});

const animateHeroTitle = async () => {
    const heroTitle = document.querySelector('[data-i18n="heroTitle"]');
    const introScreen = document.getElementById('introScreen');
    const introScreenTitle = document.getElementById('introScreenTitle');
    const finalTitle = heroTitle.dataset.jaTitle;
    const scrambleCharacters = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛜᛞ!<>+*~';
    const reducedMotion = reducedMotionPreference.matches;
    const decodeDuration = 1500;
    const titleTravelDuration = reducedMotion ? 200 : 300;
    const eyebrowFadeDuration = reducedMotion ? 300 : 650;
    const animationGeneration = ++heroAnimationGeneration;

    window.cancelAnimationFrame(heroAnimationFrame);
    heroTransitionAnimations.forEach((animation) => animation.cancel());
    heroTransitionAnimations = [];
    introScreen.hidden = false;
    introScreen.classList.remove('is-leaving');
    introScreenTitle.style.transform = '';
    introScreenTitle.textContent = 'ᚡᚡᚤᛚᚹ';
    const heroTitleStyle = window.getComputedStyle(heroTitle);
    introScreenTitle.style.fontFamily = heroTitleStyle.fontFamily;
    introScreenTitle.style.fontWeight = heroTitleStyle.fontWeight;
    introScreenTitle.style.letterSpacing = heroTitleStyle.letterSpacing;
    document.body.classList.add('intro-pending');
    document.body.classList.remove('intro-revealing');
    switchButton.disabled = true;
    heroTitle.setAttribute('aria-label', finalTitle);
    heroTitle.textContent = finalTitle;

    const startedAt = performance.now();
    let lastRenderedAt = 0;
    const renderFrame = (timestamp) => {
        if (timestamp - lastRenderedAt < 33 && timestamp - startedAt < decodeDuration) {
            heroAnimationFrame = window.requestAnimationFrame(renderFrame);
            return;
        }
        lastRenderedAt = timestamp;

        const progress = Math.min((timestamp - startedAt) / decodeDuration, 1);
        const revealedCharacters = Math.floor(progress * finalTitle.length);
        const frame = Array.from(finalTitle, (character, index) => {
            if (index < revealedCharacters) return character;
            const randomIndex = Math.floor(Math.random() * scrambleCharacters.length);
            return scrambleCharacters[randomIndex];
        }).join('');

        introScreenTitle.textContent = frame;

        if (progress < 1) {
            heroAnimationFrame = window.requestAnimationFrame(renderFrame);
            return;
        }

        introScreenTitle.textContent = finalTitle;
        document.body.classList.add('intro-revealing');
        void document.querySelector('.page-shell').offsetWidth;

        const startRect = introScreenTitle.getBoundingClientRect();
        const titleRange = document.createRange();
        titleRange.selectNodeContents(heroTitle);
        const targetRect = titleRange.getBoundingClientRect();
        const translateX = targetRect.left - startRect.left;
        const translateY = targetRect.top - startRect.top;
        const scaleX = targetRect.width / startRect.width;
        const scaleY = targetRect.height / startRect.height;

        const titleAnimation = introScreenTitle.animate(
            [
                { transform: 'translate(0, 0) scale(1, 1)' },
                { transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})` },
            ],
            { duration: titleTravelDuration, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)', fill: 'forwards' }
        );
        heroTransitionAnimations = [titleAnimation];

        titleAnimation.finished
            .then(() => {
                if (animationGeneration !== heroAnimationGeneration) return;
                introScreen.hidden = true;
                introScreenTitle.style.transform = '';
                document.body.classList.remove('intro-pending', 'intro-revealing');
                document.body.classList.add('intro-sequence-active');
                const eyebrow = document.querySelector('.page-header > .eyebrow');
                const ambientBackground = document.querySelector('.ambient-background');
                return new Promise((resolve, reject) => {
                    window.requestAnimationFrame(() => {
                        if (animationGeneration !== heroAnimationGeneration) {
                            resolve();
                            return;
                        }

                        const eyebrowAnimation = eyebrow.animate(
                            [
                                { opacity: 0, transform: 'translateY(8px)' },
                                { opacity: 1, transform: 'translateY(0)' },
                            ],
                            { duration: eyebrowFadeDuration, easing: 'ease-out', fill: 'forwards' }
                        );
                        const ambientAnimations = ambientBackground.getAnimations();
                        Promise.all([
                            eyebrowAnimation.finished,
                            ...ambientAnimations.map((animation) => animation.finished),
                        ]).then(() => window.setTimeout(resolve, 150), reject);
                    });
                });
            })
            .then(() => {
                if (animationGeneration !== heroAnimationGeneration) return;
                document.body.classList.add('intro-profile-revealing');
                const revealAnimations = [
                    ...document.querySelector('.content-grid').getAnimations(),
                    ...document.querySelector('.page-footer').getAnimations(),
                ];
                return Promise.all(revealAnimations.map((animation) => animation.finished));
            })
            .then(() => {
                if (animationGeneration !== heroAnimationGeneration) return;
                document.body.classList.remove('intro-sequence-active', 'intro-profile-revealing');
                switchButton.disabled = false;
            })
            .catch((error) => {
                if (animationGeneration !== heroAnimationGeneration) return;
                console.error('Could not finish intro transition:', error);
                introScreen.hidden = true;
                document.body.classList.remove(
                    'intro-pending',
                    'intro-revealing',
                    'intro-sequence-active',
                    'intro-profile-revealing'
                );
                switchButton.disabled = false;
            });
    };

    heroAnimationFrame = window.requestAnimationFrame(renderFrame);
};

initializeBackgroundSlideshow().catch((error) => {
    console.error('Could not initialize background slideshow:', error);
});
const languageReady = restoreSavedLanguage().then(initializeVoiceGauge);
window.addEventListener('pageshow', async () => {
    await languageReady;
    animateHeroTitle().catch((error) => {
        console.error('Could not play intro animation:', error);
        document.body.classList.remove('intro-pending', 'intro-revealing');
        document.getElementById('introScreen').hidden = true;
        document.body.classList.remove(
            'intro-sequence-active',
            'intro-profile-revealing'
        );
        switchButton.disabled = false;
    });
});
