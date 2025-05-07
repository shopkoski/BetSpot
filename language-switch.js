let currentLanguage = 'en'; // Global declaration (ONLY ONE!)
let translations; // Global variable to hold translations

document.addEventListener('DOMContentLoaded', () => {
    currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

    fetch('languages.json')
        .then(response => response.json())
        .then(data => {
            translations = data; // Store translations in the global variable
            updateUI(); // Initial UI update

            const languageButtons = document.querySelectorAll('.language.buttons button');
            languageButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const lang = button.querySelector('img').alt.toLowerCase();
                    currentLanguage = lang === "english" ? "en" : lang === "macedonian" ? "mk" : "al";
                    localStorage.setItem('selectedLanguage', currentLanguage);
                    updateUI(); // Update UI on language change
                });
            });
        })
        .catch(error => console.error("Error loading translations:", error));
});

function updateUI() {
    if (!translations) { // Check if translations are loaded
        console.warn("Translations not loaded yet. Skipping UI update.");
        return;
    }

    const textElements = {
        "home": document.querySelector('nav a[href="index.html"]'),
        "video": document.querySelector('nav a[href="video.html"]'),
        "contact": document.querySelector('nav a[href="contact_page.html"]'),
        "search": document.querySelector('.search-button'),
        "gallery": document.querySelector('.gallery-button'),
        "export_pdf": document.getElementById('exportPDF'),
        "export_excel": document.getElementById('exportExcel'),
        "previous": document.getElementById('prevButton'),
        "next": document.getElementById('nextButton'),
        "contact_title": document.querySelector('.contact-page h1'),
        "form_title": document.querySelector('.form-section h2'),
        "form_desc": document.querySelector('.form-section p'),
        "form_name": document.querySelector('label[for="name"]'),
        "form_email": document.querySelector('label[for="email"]'),
        "form_subject": document.querySelector('label[for="subject"]'),
        "form_message": document.querySelector('label[for="message"]'),
        "form_send": document.querySelector('.form-section button[type="submit"]')
    };

    Object.keys(textElements).forEach(key => {
        if (textElements[key]) {
            if (translations[currentLanguage] && translations[currentLanguage][key]) {
                textElements[key].textContent = translations[currentLanguage][key];
            } else {
                console.warn(`Translation for key "${key}" in language "${currentLanguage}" not found.`);
                textElements[key].textContent = key; // Fallback
            }
        }
    });
}