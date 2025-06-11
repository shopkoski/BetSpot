let currentLanguage = 'en'; // Global declaration (ONLY ONE!)
let translations; // Global variable to hold translations

document.addEventListener('DOMContentLoaded', () => {
    currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

    fetch('languages.json')
        .then(response => response.json())
        .then(data => {
            translations = data; // Store translations in the global variable
            updateUI(); // Initial UI update
            translateMeasurementButtons(); // Call here for initial load

            const languageButtons = document.querySelectorAll('.language.buttons button');
            languageButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const lang = button.querySelector('img').alt.toLowerCase();
                    currentLanguage = lang === "english" ? "en" : lang === "macedonian" ? "mk" : "al";
                    localStorage.setItem('selectedLanguage', currentLanguage);
                    updateUI(); // Update UI on language change
                    translateMeasurementButtons(); // Call here for language switch

                    // Dynamically update ArcGIS widget locale
                    require(["esri/config"], function(esriConfig) {
                        esriConfig.locale = currentLanguage;
                        // Reload is needed for widgets to pick up the new locale
                        // location.reload(); // Keep this commented out if you want dynamic switching without reload
                    });
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

    console.log("updateUI function called."); // Log when updateUI is called

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
        "form_send": document.querySelector('.form-section button[type="submit"]'),
        "table_id": document.querySelector('[data-key="table_id"]'),
        "table_name": document.querySelector('[data-key="table_name"]'),
        "table_address": document.querySelector('[data-key="table_address"]'),
        "search_placeholder": document.querySelector('[data-key="search_placeholder"]')
    };

    Object.keys(textElements).forEach(key => {
        if (textElements[key]) {
            if (translations[currentLanguage] && translations[currentLanguage][key]) {
                if (key === 'search_placeholder') {
                    textElements[key].placeholder = translations[currentLanguage][key];
                } else if (key === 'gallery' || key === 'search') {
                    // Preserve the icon when updating button text
                    const icon = textElements[key].querySelector('i');
                    textElements[key].textContent = translations[currentLanguage][key];
                    if (icon) {
                        textElements[key].insertBefore(icon, textElements[key].firstChild);
                    }
                } else {
                    textElements[key].textContent = translations[currentLanguage][key];
                }
            } else {
                console.warn(`Translation for key "${key}" in language "${currentLanguage}" not found.`);
                if (key === 'search_placeholder') {
                    textElements[key].placeholder = key;
                } else if (key === 'gallery' || key === 'search') {
                    // Preserve the icon when setting default text
                    const icon = textElements[key].querySelector('i');
                    textElements[key].textContent = key;
                    if (icon) {
                        textElements[key].insertBefore(icon, textElements[key].firstChild);
                    }
                } else {
                    textElements[key].textContent = key;
                }
            }
        }
    });

    // Translate LayerList widget elements (e.g., "Untitled layer")
    const untitledLayerElements = document.querySelectorAll('.esri-layer-list__item-title'); // This class might vary
    if (untitledLayerElements && translations[currentLanguage] && translations[currentLanguage]['untitledLayer']) {
        untitledLayerElements.forEach(element => {
            // Check if the current text is the default "Untitled layer" or a previous translation
            // Avoid overwriting actual layer names from your service if they exist
            const defaultEnglishText = translations['en']['untitledLayer'];
            const macedonianText = translations['mk']['untitledLayer'];
            const albanianText = translations['al']['untitledLayer'];

            if (element.textContent === defaultEnglishText ||
                element.textContent === macedonianText ||
                element.textContent === albanianText) {
                 element.textContent = translations[currentLanguage]['untitledLayer'];
            }
        });
    }

    // Translate Search widget elements
    const searchInput = document.querySelector('.esri-search__input');
    if (searchInput && translations[currentLanguage] && translations[currentLanguage]['searchPlaceholderText']) {
        searchInput.placeholder = translations[currentLanguage]['searchPlaceholderText'];
    }

    const useCurrentLocationElement = document.querySelector('.esri-search__suggestion'); // This class might vary
    if (useCurrentLocationElement && translations[currentLanguage] && translations[currentLanguage]['useCurrentLocationText']) {
         // Check if the text is the default before overwriting
         const defaultEnglishText = translations['en']['useCurrentLocationText'];
         const macedonianText = translations['mk']['useCurrentLocationText'];
         const albanianText = translations['al']['useCurrentLocationText'];

         // Temporarily store the original text to check for inclusion
         const originalText = useCurrentLocationElement.textContent;

         if (originalText.includes(defaultEnglishText) ||
             originalText.includes(macedonianText) ||
             originalText.includes(albanianText)) {

             // Preserve any icon if present
             const icon = useCurrentLocationElement.querySelector('*'); // Assuming the icon is a child element

             useCurrentLocationElement.textContent = translations[currentLanguage]['useCurrentLocationText'];

             if (icon) {
                useCurrentLocationElement.insertBefore(icon, useCurrentLocationElement.firstChild);
             }
         }
    }

    // Removed Translate custom Measurement widget elements from here
}

// New function to translate measurement widget buttons
function translateMeasurementButtons() {
    if (!translations) { // Check if translations are loaded
        console.warn("Translations not loaded yet. Skipping measurement button translation.");
        return;
    }

    const measurementLabel = document.querySelector('.esri-measurement .custom-measure-buttons div:first-child');
    const distanceButton = document.querySelector('.esri-measurement .custom-measure-buttons button:nth-of-type(1)');
    const areaButton = document.querySelector('.esri-measurement .custom-measure-buttons button:nth-of-type(2)');
    const clearButton = document.querySelector('.esri-measurement .custom-measure-buttons button:nth-of-type(3)');

    if (measurementLabel && translations[currentLanguage] && translations[currentLanguage]['startMeasurement']) {
        measurementLabel.textContent = translations[currentLanguage]['startMeasurement'];
    }

    // Use a fallback to English if the specific language translation is missing for a key
    const currentTranslation = translations[currentLanguage] || translations['en'];

    if (distanceButton && currentTranslation && currentTranslation['distance']) {
        const distanceIcon = '📏 '; // Keep the icon
        distanceButton.textContent = distanceIcon + currentTranslation['distance'];
    } else if (distanceButton) {
        // Fallback if translation is completely missing (shouldn't happen with the || translations['en'] fallback)
        distanceButton.textContent = '📏 Distance';
    }

    if (areaButton && currentTranslation && currentTranslation['area']) {
        const areaIcon = '⬛ '; // Keep the icon
        areaButton.textContent = areaIcon + currentTranslation['area'];
    } else if (areaButton) {
         // Fallback if translation is completely missing
        areaButton.textContent = '⬛ Area';
    }

     if (clearButton && currentTranslation && currentTranslation['clear']) {
        const clearIcon = '🗑️ '; // Keep the icon
        clearButton.textContent = clearIcon + currentTranslation['clear'];
    } else if (clearButton) {
         // Fallback if translation is completely missing
        clearButton.textContent = '🗑️ Clear';
    }
}