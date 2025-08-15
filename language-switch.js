let currentLanguage = 'en'; // Global declaration (ONLY ONE!)
let translations; // Global variable to hold translations

// Function to get map and view from global scope
function getMapAndView() {
    return {
        map: window.map,
        view: window.view
    };
}

// Function to get widgets from global scope
function getWidgets() {
    return window.widgets || {};
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Starting language switch setup");
    currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    console.log("Current language from localStorage:", currentLanguage);

    fetch('languages.json')
        .then(response => response.json())
        .then(data => {
            console.log("Translations loaded successfully");
            translations = data; // Store translations in the global variable
            
            // Set ArcGIS locale properly on initial load
            require(["esri/config"], function(esriConfig) {
                const localeMap = {
                    'en': 'en',
                    'mk': 'mk', // Macedonian
                    'al': 'sq'  // Albanian (ArcGIS uses 'sq' for Albanian)
                };
                const arcGISLocale = localeMap[currentLanguage] || 'en';
                esriConfig.locale = arcGISLocale;
                console.log("Initial ArcGIS locale set to:", arcGISLocale);
            });
            
            // Initial translation
            translate();
            
            // Force immediate translation of Print and Elevation widgets
            setTimeout(() => {
                console.log("Forcing immediate Print and Elevation widget translation...");
                translatePrintWidget();
                translateElevationProfileWidget();
                translateElevationProfile();
            }, 100);
            
            observeArcGISWidgets(); // Start observing for new widgets

            console.log("Setting up language buttons...");
            setupLanguageButtons();
        })
        .catch(error => console.error("Error loading translations:", error));
    });
    
    // Fallback: Try to set up language buttons again after a delay
    setTimeout(() => {
        console.log("Fallback: Trying to set up language buttons again...");
        setupLanguageButtons();
    }, 1000);
    
    // Also try to set up language buttons immediately
    setupLanguageButtons();

// Separate function to set up language buttons
function setupLanguageButtons() {
    console.log("setupLanguageButtons called");
    const languageButtons = document.querySelectorAll('.language.buttons button');
    console.log("Found language buttons:", languageButtons.length);
    
    if (languageButtons.length === 0) {
        console.error("No language buttons found! Check HTML structure.");
        return;
    }
    
    languageButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button);
        
        // Remove any existing event listeners
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelectorAll('.language.buttons button')[index];
        
        // Add visual feedback to show buttons are clickable
        newButton.style.cursor = 'pointer';
        newButton.style.transition = 'transform 0.1s ease';
        
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Visual feedback
            newButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                newButton.style.transform = 'scale(1)';
            }, 100);
            
            console.log("Language button clicked!");
            const img = newButton.querySelector('img');
            console.log("Button img:", img);
            
            if (!img) {
                console.error("No img found in button");
                return;
            }
            
            const lang = img.alt.toLowerCase();
            console.log("Language from alt:", lang);
            
            currentLanguage = lang === "english" ? "en" : lang === "macedonian" ? "mk" : "al";
            console.log("Setting currentLanguage to:", currentLanguage);
            
            // Language changed - no popup needed
            
            localStorage.setItem('selectedLanguage', currentLanguage);
            
                        // Reload the page to apply new language
            location.reload();
        });
        
        console.log(`Button ${index} event listener attached`);
    });
}

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

    // Update ArcGIS widget tooltips
    updateArcGISWidgetTooltips();
    
    // Update elevation profile widget
    translateElevationProfile();
    

    

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

function translateArcGISTooltips() {
    // Always use English for now
    const t = {
        searchTooltip: "Search",
        homeTooltip: "Home",
        locateTooltip: "Locate",
        printTooltip: "Print",
        zoomInTooltip: "Zoom in",
        zoomOutTooltip: "Zoom out",
        bookmarksTooltip: "Bookmarks",
        basemapTooltip: "Basemap",
        measurementTooltip: "Measure"
    };

    // Set tooltips for zoom, search, home, locate, etc.
    const tooltipMap = [
        { selector: '.esri-search .esri-widget--button', key: 'searchTooltip' },
        { selector: '.esri-home .esri-widget--button', key: 'homeTooltip' },
        { selector: '.esri-locate .esri-widget--button', key: 'locateTooltip' },
        { selector: '.esri-zoom-in', key: 'zoomInTooltip' },
        { selector: '.esri-zoom-out', key: 'zoomOutTooltip' }
    ];
    tooltipMap.forEach(item => {
        document.querySelectorAll(item.selector).forEach(el => {
            if (t[item.key]) {
                el.setAttribute('title', t[item.key]);
                el.setAttribute('aria-label', t[item.key]);
            }
        });
    });

    // Set tooltips for Expand widgets (Layer List, Basemap, Bookmarks, Measure, Print)
    document.querySelectorAll('.esri-expand__toggle').forEach(expandBtn => {
        const expandWidget = expandBtn.closest('.esri-expand');
        if (!expandWidget) return;
        let key = null;
        if (expandWidget.querySelector('.esri-layer-list')) key = 'layerListTooltip';
        else if (expandWidget.querySelector('.esri-basemap-gallery')) key = 'basemapTooltip';
        else if (expandWidget.querySelector('.esri-bookmarks')) key = 'bookmarksTooltip';
        else if (expandWidget.querySelector('.esri-measurement')) key = 'measurementTooltip';
        else if (expandWidget.querySelector('.esri-print')) key = 'printTooltip';
        if (key && t[key]) {
            expandBtn.setAttribute('title', t[key]);
            expandBtn.setAttribute('aria-label', t[key]);
        }
    });
}

function observeExpandTooltips() {
    document.querySelectorAll('.esri-expand__toggle').forEach(expandBtn => {
        const expandWidget = expandBtn.closest('.esri-expand');
        if (!expandWidget) return;
        let key = null;
        if (expandWidget.querySelector('.esri-layer-list')) key = 'layerListTooltip';
        else if (expandWidget.querySelector('.esri-basemap-gallery')) key = 'basemapTooltip';
        else if (expandWidget.querySelector('.esri-bookmarks')) key = 'bookmarksTooltip';
        else if (expandWidget.querySelector('.esri-measurement')) key = 'measurementTooltip';
        else if (expandWidget.querySelector('.esri-print')) key = 'printTooltip';

        // Use English for now
        const t = {
            layerListTooltip: "Layer list",
            basemapTooltip: "Basemap",
            bookmarksTooltip: "Bookmarks",
            measurementTooltip: "Measure",
            printTooltip: "Print"
        };

        if (key && t[key]) {
            // Set initially
            expandBtn.setAttribute('title', t[key]);
            expandBtn.setAttribute('aria-label', t[key]);

            // Observe for changes
            const observer = new MutationObserver(() => {
                expandBtn.setAttribute('title', t[key]);
                expandBtn.setAttribute('aria-label', t[key]);
            });
            observer.observe(expandBtn, { attributes: true, attributeFilter: ['title', 'aria-label'] });
        }
    });
}

function updateArcGISTooltips() {
    const t = translations[currentLanguage] || translations['en'];

    // Expand widgets (already handled if you recreate them, but safe to repeat)
    if (window.searchExpand) searchExpand.expandTooltip = t['searchTooltip'] || 'Search';
    if (window.basemapExpand) basemapExpand.expandTooltip = t['basemapTooltip'] || 'Basemap';
    if (window.layerListExpand) layerListExpand.expandTooltip = t['layerListTooltip'] || 'Layer list';
    if (window.measurementExpand) measurementExpand.expandTooltip = t['measurementTooltip'] || 'Measure';
    if (window.bookmarksExpand) bookmarksExpand.expandTooltip = t['bookmarksTooltip'] || 'Bookmarks';
    if (window.printExpand) printExpand.expandTooltip = t['printTooltip'] || 'Print';

    // Home, Locate, Zoom
    document.querySelectorAll('.esri-home .esri-widget--button').forEach(el => {
        el.setAttribute('title', t['homeTooltip'] || 'Default map view');
        el.setAttribute('aria-label', t['homeTooltip'] || 'Default map view');
    });
    document.querySelectorAll('.esri-locate .esri-widget--button').forEach(el => {
        el.setAttribute('title', translations[currentLanguage]['locateTooltip'] || 'Find my location');
        el.setAttribute('aria-label', translations[currentLanguage]['locateTooltip'] || 'Find my location');
    });
    // Zoom In
    document.querySelectorAll('.esri-zoom-in, .esri-zoom-in .esri-widget--button').forEach(el => {
        el.setAttribute('title', t['zoomInTooltip'] || 'Zoom in');
        el.setAttribute('aria-label', t['zoomInTooltip'] || 'Zoom in');
    });
    // Zoom Out
    document.querySelectorAll('.esri-zoom-out, .esri-zoom-out .esri-widget--button').forEach(el => {
        el.setAttribute('title', t['zoomOutTooltip'] || 'Zoom out');
        el.setAttribute('aria-label', t['zoomOutTooltip'] || 'Zoom out');
    });

    // Fullscreen
    document.querySelectorAll('.esri-fullscreen .esri-widget--button').forEach(el => {
        // ArcGIS toggles between enter/exit fullscreen
        if (el.getAttribute('aria-label') && el.getAttribute('aria-label').toLowerCase().includes('exit')) {
            el.setAttribute('title', t['exitFullscreenTooltip'] || 'Exit fullscreen');
            el.setAttribute('aria-label', t['exitFullscreenTooltip'] || 'Exit fullscreen');
        } else {
            el.setAttribute('title', t['fullscreenTooltip'] || 'Enter fullscreen');
            el.setAttribute('aria-label', t['fullscreenTooltip'] || 'Enter fullscreen');
        }
    });

    // Collapse (Expand widget collapse button)
    document.querySelectorAll('.esri-expand__collapse').forEach(el => {
        el.setAttribute('title', t['collapseTooltip'] || 'Collapse');
        el.setAttribute('aria-label', t['collapseTooltip'] || 'Collapse');
    });

    // Sketch widget tooltips (e.g., Select by lasso)
    document.querySelectorAll('.esri-sketch__tool--lasso').forEach(el => {
        el.setAttribute('title', t['selectByLassoTooltip'] || 'Select by lasso');
        el.setAttribute('aria-label', t['selectByLassoTooltip'] || 'Select by lasso');
    });

    // Add more selectors for other tooltips as needed...
}

function updateZoomTooltips() {
    const t = translations[currentLanguage] || translations['en'];
    // Zoom In
    document.querySelectorAll('.esri-zoom-in, .esri-zoom-in .esri-widget--button').forEach(el => {
        el.setAttribute('title', t['zoomInTooltip'] || 'Zoom in');
        el.setAttribute('aria-label', t['zoomInTooltip'] || 'Zoom in');
    });
    // Zoom Out
    document.querySelectorAll('.esri-zoom-out, .esri-zoom-out .esri-widget--button').forEach(el => {
        el.setAttribute('title', t['zoomOutTooltip'] || 'Zoom out');
        el.setAttribute('aria-label', t['zoomOutTooltip'] || 'Zoom out');
    });
}

function observeZoomTooltips() {
    const t = translations[currentLanguage] || translations['en'];
    document.querySelectorAll('.esri-zoom-in, .esri-zoom-out').forEach(el => {
        const isZoomIn = el.classList.contains('esri-zoom-in');
        const tooltip = isZoomIn ? (t['zoomInTooltip'] || 'Zoom in') : (t['zoomOutTooltip'] || 'Zoom out');
        el.setAttribute('title', tooltip);
        el.setAttribute('aria-label', tooltip);

        // Observe for changes and re-apply
        const observer = new MutationObserver(() => {
            el.setAttribute('title', tooltip);
            el.setAttribute('aria-label', tooltip);
        });
        observer.observe(el, { attributes: true, attributeFilter: ['title', 'aria-label'] });
    });
}

// After updateUI() and translateMeasurementButtons()
setTimeout(() => {
    updateArcGISWidgetTooltips();
    updateArcGISTooltips();
    updateZoomTooltips();
    observeZoomTooltips();
    observeArcGISWidgets(); // Start observing for new widgets
}, 300);

// New function to update ArcGIS widget tooltips
function updateArcGISWidgetTooltips() {
    if (!translations || !translations[currentLanguage]) {
        console.warn("Translations not loaded yet. Skipping ArcGIS tooltip update.");
        return;
    }

    const t = translations[currentLanguage];

    // Update Home widget tooltip
    const homeButtons = document.querySelectorAll('.esri-home .esri-widget--button');
    homeButtons.forEach(button => {
        button.setAttribute('title', t['homeTooltip'] || 'Default map view');
        button.setAttribute('aria-label', t['homeTooltip'] || 'Default map view');
    });

    // Update Zoom In widget tooltip
    const zoomInButtons = document.querySelectorAll('.esri-zoom-in, .esri-zoom-in .esri-widget--button');
    zoomInButtons.forEach(button => {
        button.setAttribute('title', t['zoomInTooltip'] || 'Zoom in');
        button.setAttribute('aria-label', t['zoomInTooltip'] || 'Zoom in');
    });

    // Update Zoom Out widget tooltip
    const zoomOutButtons = document.querySelectorAll('.esri-zoom-out, .esri-zoom-out .esri-widget--button');
    zoomOutButtons.forEach(button => {
        button.setAttribute('title', t['zoomOutTooltip'] || 'Zoom out');
        button.setAttribute('aria-label', t['zoomOutTooltip'] || 'Zoom out');
    });

    // Update Locate widget tooltip
    const locateButtons = document.querySelectorAll('.esri-locate .esri-widget--button');
    locateButtons.forEach(button => {
        button.setAttribute('title', t['locateTooltip'] || 'Find my location');
        button.setAttribute('aria-label', t['locateTooltip'] || 'Find my location');
    });

    // Update Expand widget tooltips
    const expandToggles = document.querySelectorAll('.esri-expand__toggle');
    expandToggles.forEach(toggle => {
        const expandWidget = toggle.closest('.esri-expand');
        if (!expandWidget) return;

        let tooltipKey = null;
        if (expandWidget.querySelector('.esri-search')) {
            tooltipKey = 'searchTooltip';
        } else if (expandWidget.querySelector('.esri-basemap-gallery')) {
            tooltipKey = 'basemapTooltip';
        } else if (expandWidget.querySelector('.esri-layer-list')) {
            tooltipKey = 'layerListTooltip';
        } else if (expandWidget.querySelector('.esri-measurement')) {
            tooltipKey = 'measurementTooltip';
        } else if (expandWidget.querySelector('.esri-bookmarks')) {
            tooltipKey = 'bookmarksTooltip';
        } else if (expandWidget.querySelector('.esri-print')) {
            tooltipKey = 'printTooltip';
        }

        if (tooltipKey && t[tooltipKey]) {
            toggle.setAttribute('title', t[tooltipKey]);
            toggle.setAttribute('aria-label', t[tooltipKey]);
        }
    });

    // Update Fullscreen widget tooltip
    const fullscreenButtons = document.querySelectorAll('.esri-fullscreen .esri-widget--button');
    fullscreenButtons.forEach(button => {
        const isFullscreen = button.getAttribute('aria-label') && 
                           button.getAttribute('aria-label').toLowerCase().includes('exit');
        const tooltip = isFullscreen ? 
            (t['exitFullscreenTooltip'] || 'Exit fullscreen') : 
            (t['fullscreenTooltip'] || 'Enter fullscreen');
        button.setAttribute('title', tooltip);
        button.setAttribute('aria-label', tooltip);
    });

    // Update Search widget placeholder
    const searchInputs = document.querySelectorAll('.esri-search__input');
    searchInputs.forEach(input => {
        if (t['searchPlaceholderText']) {
            input.placeholder = t['searchPlaceholderText'];
        }
    });

    // Update Search widget "Use current location" text
    const useCurrentLocationElements = document.querySelectorAll('.esri-search__suggestion');
    useCurrentLocationElements.forEach(element => {
        if (t['useCurrentLocationText']) {
            const icon = element.querySelector('*');
            element.textContent = t['useCurrentLocationText'];
            if (icon) {
                element.insertBefore(icon, element.firstChild);
            }
        }
    });

    // Update LayerList "Untitled layer" text
    const untitledLayerElements = document.querySelectorAll('.esri-layer-list__item-title');
    untitledLayerElements.forEach(element => {
        if (t['untitledLayer']) {
            const defaultTexts = [
                translations['en']['untitledLayer'],
                translations['mk']['untitledLayer'],
                translations['al']['untitledLayer']
            ];
            if (defaultTexts.includes(element.textContent)) {
                element.textContent = t['untitledLayer'];
            }
        }
    });

    // Update Bookmarks widget elements
    const noBookmarksElements = document.querySelectorAll('.esri-bookmarks__no-bookmarks, .esri-bookmarks__no-bookmarks-message');
    noBookmarksElements.forEach(element => {
        if (t['noBookmarksText']) {
            element.textContent = t['noBookmarksText'];
        }
    });

    const addBookmarksHintElements = document.querySelectorAll('.esri-bookmarks__hint, .esri-bookmarks__no-bookmarks-text');
    addBookmarksHintElements.forEach(element => {
        if (t['addBookmarksHintText']) {
            element.textContent = t['addBookmarksHintText'];
        }
    });

    const addBookmarkButtons = document.querySelectorAll('.esri-bookmarks__add-bookmark-button, .esri-bookmarks__container .esri-button');
    addBookmarkButtons.forEach(button => {
        if (t['addBookmarkButtonText']) {
            button.textContent = t['addBookmarkButtonText'];
        }
    });
    
    // Target calcite-fab elements specifically for hover tooltips
    const calciteFabElements = document.querySelectorAll('calcite-fab');
    calciteFabElements.forEach(element => {
        const title = element.getAttribute('title');
        if (title === 'Add bookmark' && t['addBookmarkButtonText']) {
            element.setAttribute('title', t['addBookmarkButtonText']);
        }
        // Also check the text content of calcite-fab
        const text = element.textContent.trim();
        if (text === 'Add bookmark' && t['addBookmarkButtonText']) {
            element.textContent = t['addBookmarkButtonText'];
        }
    });
    
    // Only target specific bookmarks elements to avoid breaking UI
    const bookmarksElements = document.querySelectorAll('.esri-bookmarks *');
    bookmarksElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();
            if (text === 'No bookmarks' && t['noBookmarksText']) {
                element.textContent = t['noBookmarksText'];
            }
            if (text === 'Add bookmarks to your map and they will appear here.' && t['addBookmarksHintText']) {
                element.textContent = t['addBookmarksHintText'];
            }
            if (text === 'Add bookmark' && t['addBookmarkButtonText']) {
                element.textContent = t['addBookmarkButtonText'];
            }
        }
    });

    // Update Print/Export dialog elements
    const exportDialogTitles = document.querySelectorAll('.esri-print__title, .esri-print__dialog-title');
    exportDialogTitles.forEach(element => {
        if (t['exportDialogTitle']) {
            element.textContent = t['exportDialogTitle'];
        }
    });

    // Update tab labels
    const tabLabels = document.querySelectorAll('.esri-print__tab-label');
    tabLabels.forEach((tab, index) => {
        if (index === 0 && t['layoutTab']) {
            tab.textContent = t['layoutTab'];
        } else if (index === 1 && t['mapOnlyTab']) {
            tab.textContent = t['mapOnlyTab'];
        } else if (index === 2 && t['exportsTab']) {
            tab.textContent = t['exportsTab'];
        }
    });

    // Update form labels and placeholders
    const titleLabels = document.querySelectorAll('.esri-print__title-label');
    titleLabels.forEach(element => {
        if (t['titleLabel']) {
            element.textContent = t['titleLabel'];
        }
    });

    const titleInputs = document.querySelectorAll('.esri-print__title-input');
    titleInputs.forEach(input => {
        if (t['titleOfFilePlaceholder']) {
            input.placeholder = t['titleOfFilePlaceholder'];
        }
    });

    const templateLabels = document.querySelectorAll('.esri-print__template-label');
    templateLabels.forEach(element => {
        if (t['templateLabel']) {
            element.textContent = t['templateLabel'];
        }
    });

    const showPrintAreaLabels = document.querySelectorAll('.esri-print__show-print-area-label');
    showPrintAreaLabels.forEach(element => {
        if (t['showPrintAreaLabel']) {
            element.textContent = t['showPrintAreaLabel'];
        }
    });

    const fileFormatLabels = document.querySelectorAll('.esri-print__file-format-label');
    fileFormatLabels.forEach(element => {
        if (t['fileFormatLabel']) {
            element.textContent = t['fileFormatLabel'];
        }
    });

    const advancedOptionsLabels = document.querySelectorAll('.esri-print__advanced-options-label');
    advancedOptionsLabels.forEach(element => {
        if (t['advancedOptionsLabel']) {
            element.textContent = t['advancedOptionsLabel'];
        }
    });

    // Update Export button
    const exportButtons = document.querySelectorAll('.esri-print__export-button, .esri-print__submit-button');
    exportButtons.forEach(button => {
        if (t['exportButtonText']) {
            button.textContent = t['exportButtonText'];
        }
    });

    // Update Elevation Profile widget elements
    const elevationInstructions = document.querySelectorAll('.esri-elevation-profile__instruction');
    elevationInstructions.forEach(element => {
        if (t['elevationProfileInstruction']) {
            element.textContent = t['elevationProfileInstruction'];
        }
    });

    const groundElevationLabels = document.querySelectorAll('.esri-elevation-profile__ground-elevation-label');
    groundElevationLabels.forEach(element => {
        if (t['groundElevationLabel']) {
            element.textContent = t['groundElevationLabel'];
        }
    });

    const selectLineButtons = document.querySelectorAll('.esri-elevation-profile__select-line-button');
    selectLineButtons.forEach(button => {
        if (t['selectLineButtonText']) {
            button.textContent = t['selectLineButtonText'];
        }
    });

    const newProfileButtons = document.querySelectorAll('.esri-elevation-profile__new-profile-button');
    newProfileButtons.forEach(button => {
        if (t['newProfileButtonText']) {
            button.textContent = t['newProfileButtonText'];
        }
    });



    // Update Sketch widget tooltips (drawing tools)
    const sketchTooltips = [
        { selector: '.esri-sketch__tool--point', key: 'drawPointTooltip' },
        { selector: '.esri-sketch__tool--polyline', key: 'drawPolylineTooltip' },
        { selector: '.esri-sketch__tool--polygon', key: 'drawPolygonTooltip' },
        { selector: '.esri-sketch__tool--circle', key: 'drawCircleTooltip' },
        { selector: '.esri-sketch__tool--rectangle', key: 'drawRectangleTooltip' },
        { selector: '.esri-sketch__tool--lasso', key: 'selectByLassoTooltip' },
        { selector: '.esri-sketch__tool--rectangle-select', key: 'selectByRectangleTooltip' },
        { selector: '.esri-sketch__tool--select', key: 'selectFeatureTooltip' }
    ];

    sketchTooltips.forEach(tooltip => {
        const elements = document.querySelectorAll(tooltip.selector);
        elements.forEach(element => {
            if (t[tooltip.key]) {
                element.setAttribute('title', t[tooltip.key]);
                element.setAttribute('aria-label', t[tooltip.key]);
            }
        });
    });

    // Update Coordinate Conversion widget tooltips
    const coordinateElements = document.querySelectorAll('.esri-coordinate-conversion');
    coordinateElements.forEach(element => {
        // Update "xy conversion output" text
        const outputElements = element.querySelectorAll('.esri-coordinate-conversion__output');
        outputElements.forEach(output => {
            if (t['xyConversionOutputTooltip']) {
                output.setAttribute('title', t['xyConversionOutputTooltip']);
                output.setAttribute('aria-label', t['xyConversionOutputTooltip']);
            }
        });
    });

    // Update Settings/Configuration tooltips
    const settingsElements = document.querySelectorAll('.esri-widget--button[title*="Settings"], .esri-widget--button[title*="settings"]');
    settingsElements.forEach(element => {
        if (t['settingsTooltip']) {
            element.setAttribute('title', t['settingsTooltip']);
            element.setAttribute('aria-label', t['settingsTooltip']);
        }
    });

    // Update any generic tooltips that might contain English text
    const allTooltips = document.querySelectorAll('[title], [aria-label]');
    allTooltips.forEach(element => {
        const title = element.getAttribute('title');
        const ariaLabel = element.getAttribute('aria-label');
        
        // Check for common English tooltip patterns and replace them
        const tooltipMappings = [
            { english: 'Select feature', key: 'selectFeatureTooltip' },
            { english: 'Draw a circle', key: 'drawCircleTooltip' },
            { english: 'Settings', key: 'settingsTooltip' },
            { english: 'Select by rectangle', key: 'selectByRectangleTooltip' },
            { english: 'Select by lasso', key: 'selectByLassoTooltip' },
            { english: 'Find my location', key: 'locateTooltip' },
            { english: 'Enter fullscreen', key: 'fullscreenTooltip' },
            { english: 'Draw a polyline', key: 'drawPolylineTooltip' },
            { english: 'xy conversion output', key: 'xyConversionOutputTooltip' },
            { english: 'Draw a polygon', key: 'drawPolygonTooltip' },
            { english: 'Draw a point', key: 'drawPointTooltip' },
            { english: 'Draw a rectangle', key: 'drawRectangleTooltip' },
            { english: 'Default map view', key: 'defaultMapViewTooltip' },
            { english: 'Zoom in', key: 'zoomInTooltip' },
            { english: 'Zoom out', key: 'zoomOutTooltip' }
        ];

        tooltipMappings.forEach(mapping => {
            if (title === mapping.english && t[mapping.key]) {
                element.setAttribute('title', t[mapping.key]);
            }
            if (ariaLabel === mapping.english && t[mapping.key]) {
                element.setAttribute('aria-label', t[mapping.key]);
            }
        });
    });

    console.log("ArcGIS widget tooltips updated for language:", currentLanguage);
}

// Simple function to translate export dialog elements safely
function translateExportDialog() {
    if (!translations || !translations[currentLanguage]) {
        return;
    }

    const t = translations[currentLanguage];
    
    // Only translate tooltips and basic attributes - no content manipulation
    const exportDialog = document.querySelector('.esri-print__dialog, .esri-print');
    if (exportDialog) {
        // Translate tooltips only
        const tooltipElements = exportDialog.querySelectorAll('[title], [aria-label]');
        tooltipElements.forEach(element => {
            const title = element.getAttribute('title');
            const ariaLabel = element.getAttribute('aria-label');
            
            const tooltipMappings = [
                { english: 'Export', key: 'exportButtonText' },
                { english: 'Print', key: 'printTooltip' },
                { english: 'Layout', key: 'layoutTab' },
                { english: 'Map only', key: 'mapOnlyTab' },
                { english: 'Exports', key: 'exportsTab' }
            ];

            tooltipMappings.forEach(mapping => {
                if (title === mapping.english && t[mapping.key]) {
                    element.setAttribute('title', t[mapping.key]);
                }
                if (ariaLabel === mapping.english && t[mapping.key]) {
                    element.setAttribute('aria-label', t[mapping.key]);
                }
            });
        });
    }
}

// Ultra-fast elevation profile translation - NO DELAYS
function translateElevationProfile() {
    if (!translations || !translations[currentLanguage]) return;
    
    const t = translations[currentLanguage];
    
    // Target calcite-button elements specifically (ArcGIS uses these)
    const calciteButtons = document.querySelectorAll('calcite-button');
    calciteButtons.forEach(button => {
        const text = button.textContent.trim();
        if (text === 'Select line' && t.selectLineButtonText) {
            button.textContent = t.selectLineButtonText;
        }
        if (text === 'New profile' && t.newProfileButtonText) {
            button.textContent = t.newProfileButtonText;
        }
        if (text === 'Collapse' && t.collapseTooltip) {
            button.textContent = t.collapseTooltip;
        }
    });
    
    // Also try regular buttons as backup
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        const text = button.textContent.trim();
        if (text === 'Select line' && t.selectLineButtonText) {
            button.textContent = t.selectLineButtonText;
        }
        if (text === 'New profile' && t.newProfileButtonText) {
            button.textContent = t.newProfileButtonText;
        }
        if (text === 'Collapse' && t.collapseTooltip) {
            button.textContent = t.collapseTooltip;
        }
    });
    
    // Target text elements within elevation profile widget
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();
            if (text === 'Draw or select line to generate an elevation profile.' && t.elevationProfileInstruction) {
                element.textContent = t.elevationProfileInstruction;
            }
            if (text === 'Ground Elevation' && t.groundElevationLabel) {
                element.textContent = t.groundElevationLabel;
            }
        }
    });
}

// Additional function to specifically target elevation profile buttons globally
function translateElevationButtons() {
    if (!translations || !translations[currentLanguage]) {
        return;
    }

    const t = translations[currentLanguage];
    
    console.log("Starting global elevation button translation...");
    
    // Find ALL buttons on the page and check for elevation profile buttons
    const allButtons = document.querySelectorAll('button');
    console.log("Total buttons found:", allButtons.length);
    
    allButtons.forEach((button, index) => {
        const text = button.textContent.trim();
        
        // Check if this looks like an elevation profile button
        if (text === 'Select line') {
            console.log(`Found Select line button ${index}, translating...`);
            if (t['selectLineButtonText']) {
                button.textContent = t['selectLineButtonText'];
                console.log("Select line translated to:", t['selectLineButtonText']);
            }
        }
        
        if (text === 'New profile') {
            console.log(`Found New profile button ${index}, translating...`);
            if (t['newProfileButtonText']) {
                button.textContent = t['newProfileButtonText'];
                console.log("New profile translated to:", t['newProfileButtonText']);
            }
        }
    });
}



// Function to continuously scan and translate any remaining English text - OPTIMIZED
function continuousTextTranslation() {
    if (!translations || !translations[currentLanguage]) {
        return;
    }

    const t = translations[currentLanguage];
    
    // Only handle simple tooltips - no aggressive DOM manipulation
    const tooltipElements = document.querySelectorAll('[title], [aria-label]');
    tooltipElements.forEach(element => {
        const title = element.getAttribute('title');
        const ariaLabel = element.getAttribute('aria-label');
        
        // Simple tooltip mappings only
        const tooltipMappings = [
            { english: 'Zoom in', key: 'zoomInTooltip' },
            { english: 'Zoom out', key: 'zoomOutTooltip' },
            { english: 'Find my location', key: 'locateTooltip' },
            { english: 'Default map view', key: 'defaultMapViewTooltip' },
            { english: 'Enter fullscreen', key: 'fullscreenTooltip' },
            { english: 'Exit fullscreen', key: 'exitFullscreenTooltip' }
        ];

        tooltipMappings.forEach(mapping => {
            if (title === mapping.english && t[mapping.key]) {
                element.setAttribute('title', t[mapping.key]);
            }
            if (ariaLabel === mapping.english && t[mapping.key]) {
                element.setAttribute('aria-label', t[mapping.key]);
            }
        });
    });

    // AGGRESSIVE: Translate ALL text elements on the page
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
            const text = element.textContent.trim();
            
            // Comprehensive mapping of ALL English text to translations
            const textMappings = [
                // Print/Export Dialog
                { english: 'Print', key: 'printTooltip' },
                { english: 'Export', key: 'exportDialogTitle' },
                { english: 'Layout', key: 'layoutTab' },
                { english: 'Map only', key: 'mapOnlyTab' },
                { english: 'Exports', key: 'exportsTab' },
                { english: 'Template', key: 'templateLabel' },
                { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                { english: 'Show print area', key: 'showPrintAreaLabel' },
                { english: 'File format', key: 'fileFormatLabel' },
                { english: 'PDF', key: 'pdfFormat' },
                { english: 'Advanced options', key: 'advancedOptionsLabel' },
                { english: 'Set scale', key: 'setScaleLabel' },
                { english: 'DPI', key: 'dpiLabel' },
                { english: 'Include legend', key: 'includeLegendLabel' },
                { english: 'Include attribution', key: 'includeAttributionLabel' },
                { english: 'File name', key: 'fileNameLabel' },
                { english: 'Width', key: 'widthLabel' },
                { english: 'Height', key: 'heightLabel' },
                { english: 'No exported files', key: 'noExportedFilesText' },
                { english: 'Cancel', key: 'bookmarkCancelButton' },
                { english: 'Add', key: 'bookmarkAddButton' },
                
                // Bookmarks
                { english: 'Add bookmark', key: 'addBookmarkButtonText' },
                { english: 'Title', key: 'bookmarkTitleLabel' },
                { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                { english: 'No bookmarks', key: 'noBookmarksText' },
                { english: 'Add bookmarks to save locations', key: 'addBookmarksHintText' },
                
                // Elevation Profile
                { english: 'Units', key: 'unitsLabel' },
                { english: 'Metric', key: 'metricValue' },
                { english: 'Uniform chart scaling', key: 'uniformChartScalingLabel' },
                { english: 'Select line', key: 'selectLineButtonText' },
                { english: 'New profile', key: 'newProfileButtonText' },
                
                // Other common elements
                { english: 'XY', key: 'xyConversionOutputTooltip' },
                { english: 'Powered by Esri', key: 'poweredByEsri' }
            ];
            
            textMappings.forEach(mapping => {
                if (text === mapping.english && t[mapping.key]) {
                    element.textContent = t[mapping.key];
                    console.log(`AGGRESSIVE: Translated "${mapping.english}" to "${t[mapping.key]}"`);
                }
            });
        }
    });
    
    // Also translate placeholders
    const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputElements.forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
            const placeholderMappings = [
                { english: 'File name', key: 'fileNamePlaceholder' },
                { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                { english: 'Title of file', key: 'titleOfFilePlaceholder' }
            ];
            
            placeholderMappings.forEach(mapping => {
                if (placeholder === mapping.english && t[mapping.key]) {
                    input.setAttribute('placeholder', t[mapping.key]);
                    console.log(`AGGRESSIVE: Translated placeholder "${mapping.english}" to "${t[mapping.key]}"`);
                }
            });
        }
    });
    
    // Also call specific translation functions with higher priority
    translateBookmarksForm();
    translatePrintWidget();
    translateElevationProfileWidget();
    translateElevationProfile();
}

// Start continuous translation scanning
let translationInterval;
function startContinuousTranslation() {
    // Clear any existing interval
    if (translationInterval) {
        clearInterval(translationInterval);
    }
    
    // Run immediately
    continuousTextTranslation();
    
    // Then run every 500ms (very fast response)
    translationInterval = setInterval(continuousTextTranslation, 500);
}

// Function to stop continuous translation
function stopContinuousTranslation() {
    if (translationInterval) {
        clearInterval(translationInterval);
        translationInterval = null;
    }
}

// Function to observe DOM changes and update tooltips for new widgets
function observeArcGISWidgets() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        let printDialogOpened = false;
        let bookmarkDialogOpened = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if Print dialog was opened
                        if (node.classList && (
                            node.classList.contains('esri-print__dialog') ||
                            node.classList.contains('esri-print') ||
                            node.classList.contains('esri-print__container')
                        )) {
                            printDialogOpened = true;
                            console.log("Print dialog detected, triggering translation...");
                        }
                        
                        // Check if Bookmark dialog was opened
                        if (node.classList && (
                            node.classList.contains('esri-bookmarks__dialog') ||
                            node.classList.contains('esri-bookmarks') ||
                            node.querySelector && node.querySelector('.esri-bookmarks__dialog')
                        )) {
                            bookmarkDialogOpened = true;
                            console.log("Bookmark dialog detected, triggering translation...");
                        }
                        
                        // Check if any ArcGIS widget classes were added
                        if (node.classList && (
                            node.classList.contains('esri-home') ||
                            node.classList.contains('esri-zoom-in') ||
                            node.classList.contains('esri-zoom-out') ||
                            node.classList.contains('esri-locate') ||
                            node.classList.contains('esri-expand') ||
                            node.classList.contains('esri-fullscreen') ||
                            node.classList.contains('esri-search') ||
                            node.classList.contains('esri-basemap-gallery') ||
                            node.classList.contains('esri-layer-list') ||
                            node.classList.contains('esri-measurement') ||
                            node.classList.contains('esri-bookmarks') ||
                            node.classList.contains('esri-print')
                        )) {
                            shouldUpdate = true;
                        }
                        
                        // Also check child elements
                        if (node.querySelector && node.querySelector('.esri-home, .esri-zoom-in, .esri-zoom-out, .esri-locate, .esri-expand, .esri-fullscreen, .esri-search, .esri-basemap-gallery, .esri-layer-list, .esri-measurement, .esri-bookmarks, .esri-print')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (printDialogOpened) {
            // Immediate translation when Print dialog opens
            setTimeout(() => {
                console.log("Print dialog opened, translating immediately...");
                translatePrintWidget();
            }, 100);
        }
        
        if (bookmarkDialogOpened) {
            // Immediate translation when Bookmark dialog opens
            setTimeout(() => {
                console.log("Bookmark dialog opened, translating immediately...");
                translateBookmarksForm();
            }, 100);
        }
        
        if (shouldUpdate) {
            // Small delay to ensure the widget is fully rendered
            setTimeout(() => {
                updateArcGISWidgetTooltips();
            }, 100);
        }
    });

    observer.observe(mapContainer, {
        childList: true,
        subtree: true
    });

    console.log("ArcGIS widget observer started with Print dialog detection");
}

// Function to specifically translate bookmarks form elements - COMPREHENSIVE (like Print widget)
function translateBookmarksForm() {
    if (!translations || !translations[currentLanguage]) return;
    
    const t = translations[currentLanguage];
    
    // Direct targeting of Bookmark dialog elements based on what we see in the DOM
    console.log("Direct Bookmark dialog translation starting...");
    
    // Target all calcite-label elements (which contain the labels we see)
    const calciteLabels = document.querySelectorAll('calcite-label');
    calciteLabels.forEach(label => {
        // Only translate if this is a simple text label, not a container with inputs
        if (label.children.length === 0 || label.children.length === 1) {
            const text = label.textContent.trim();
            console.log("Found calcite-label with text:", text);
            
            if (text === 'Title' && t['bookmarkTitleInputLabel']) {
                // Find the text node and replace only that
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Title') {
                        textNode.textContent = textNode.textContent.replace('Title', t['bookmarkTitleInputLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Title" → "${t['bookmarkTitleInputLabel']}"`);
                    }
                });
            }
        }
    });
    
    // Target all span elements that might contain the labels
    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
        // Only translate if this is a simple text span, not a container with inputs
        if (span.children.length === 0) {
            const text = span.textContent.trim();
            if (text) {
                console.log("Found span with text:", text);
                
                if (text === 'Title' && t['bookmarkTitleInputLabel']) {
                    span.textContent = t['bookmarkTitleInputLabel'];
                    console.log(`SPAN TRANSLATED: "Title" → "${t['bookmarkTitleInputLabel']}"`);
                } else if (text === 'Add bookmark' && t['addBookmarkDialogTitle']) {
                    span.textContent = t['addBookmarkDialogTitle'];
                    console.log(`SPAN TRANSLATED: "Add bookmark" → "${t['addBookmarkDialogTitle']}"`);
                }
            }
        }
    });
    
    // Target all div elements that might contain the labels
    const divs = document.querySelectorAll('div');
    divs.forEach(div => {
        const text = div.textContent.trim();
        if (text && div.children.length === 0) {
            console.log("Found div with text:", text);
            
            if (text === 'Title' && t['bookmarkTitleInputLabel']) {
                div.textContent = t['bookmarkTitleInputLabel'];
                console.log(`DIV TRANSLATED: "Title" → "${t['bookmarkTitleInputLabel']}"`);
            } else if (text === 'Add bookmark' && t['addBookmarkDialogTitle']) {
                div.textContent = t['addBookmarkDialogTitle'];
                console.log(`DIV TRANSLATED: "Add bookmark" → "${t['addBookmarkDialogTitle']}"`);
            }
        }
    });
    
    // Target Bookmark widget dialog elements - be more comprehensive
    const bookmarkDialog = document.querySelector('.esri-bookmarks__dialog, .esri-bookmarks, [role="dialog"]');
    if (!bookmarkDialog) {
        console.log("Bookmark dialog not found, trying alternative selectors...");
        // Try alternative selectors
        const alternativeSelectors = [
            '.esri-bookmarks',
            '.esri-bookmarks__container',
            '.esri-bookmarks__dialog',
            '[class*="bookmark"]',
            '[class*="bookmarks"]'
        ];
        
        for (const selector of alternativeSelectors) {
            const found = document.querySelector(selector);
            if (found) {
                console.log("Found bookmark dialog with selector:", selector);
                break;
            }
        }
        
        // If still not found, try to translate any bookmark-related elements
        console.log("Trying to translate any bookmark-related elements...");
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                const text = element.textContent.trim();
                
                // Bookmark-specific text mappings
                const bookmarkTextMappings = [
                    { english: 'Add bookmark', key: 'addBookmarkDialogTitle' },
                    { english: 'Title', key: 'bookmarkTitleInputLabel' },
                    { english: 'Enter a title', key: 'bookmarkTitleInputPlaceholder' },
                    { english: 'Cancel', key: 'bookmarkCancelButton' },
                    { english: 'Add', key: 'bookmarkAddButton' }
                ];
                
                bookmarkTextMappings.forEach(mapping => {
                    if (text === mapping.english && t[mapping.key]) {
                        element.textContent = t[mapping.key];
                        console.log(`BOOKMARK TRANSLATED: "${mapping.english}" → "${t[mapping.key]}"`);
                    }
                });
            }
        });
        
        return;
    }
    
    // Translate dialog title
    const dialogTitle = bookmarkDialog.querySelector('.esri-bookmarks__title, .esri-bookmarks__dialog-title, h1, h2, h3');
    if (dialogTitle && t['addBookmarkDialogTitle']) {
        dialogTitle.textContent = t['addBookmarkDialogTitle'];
        console.log(`BOOKMARK DIALOG TITLE TRANSLATED: "Add bookmark" → "${t['addBookmarkDialogTitle']}"`);
    }
    
    // Translate form labels
    const titleLabel = bookmarkDialog.querySelector('.esri-bookmarks__title-label, calcite-label');
    if (titleLabel && t['bookmarkTitleInputLabel']) {
        titleLabel.textContent = t['bookmarkTitleInputLabel'];
        console.log(`BOOKMARK TITLE LABEL TRANSLATED: "Title" → "${t['bookmarkTitleInputLabel']}"`);
    }
    
    // Translate input placeholders
    const titleInput = bookmarkDialog.querySelector('input[placeholder], textarea[placeholder]');
    if (titleInput && t['bookmarkTitleInputPlaceholder']) {
        titleInput.placeholder = t['bookmarkTitleInputPlaceholder'];
        console.log(`BOOKMARK PLACEHOLDER TRANSLATED: "Enter a title" → "${t['bookmarkTitleInputPlaceholder']}"`);
    }
    
    // Translate buttons
    const cancelButton = bookmarkDialog.querySelector('calcite-button, button');
    if (cancelButton && t['bookmarkCancelButton']) {
        const text = cancelButton.textContent.trim();
        if (text === 'Cancel') {
            cancelButton.textContent = t['bookmarkCancelButton'];
            console.log(`BOOKMARK CANCEL BUTTON TRANSLATED: "Cancel" → "${t['bookmarkCancelButton']}"`);
        }
    }
    
    const addButton = bookmarkDialog.querySelector('calcite-button, button');
    if (addButton && t['bookmarkAddButton']) {
        const text = addButton.textContent.trim();
        if (text === 'Add') {
            addButton.textContent = t['bookmarkAddButton'];
            console.log(`BOOKMARK ADD BUTTON TRANSLATED: "Add" → "${t['bookmarkAddButton']}"`);
        }
    }
    
    // Also try to find elements by content matching for any missed elements
    const allElements = bookmarkDialog.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();
            
            // Map English text to translation keys
            const textMappings = [
                { english: 'Add bookmark', key: 'addBookmarkDialogTitle' },
                { english: 'Title', key: 'bookmarkTitleInputLabel' },
                { english: 'Enter a title', key: 'bookmarkTitleInputPlaceholder' },
                { english: 'Cancel', key: 'bookmarkCancelButton' },
                { english: 'Add', key: 'bookmarkAddButton' }
            ];
            
            textMappings.forEach(mapping => {
                if (text === mapping.english && t[mapping.key]) {
                    element.textContent = t[mapping.key];
                    console.log(`Translated "${mapping.english}" to "${t[mapping.key]}"`);
                }
            });
        }
    });
    
    // Also try to translate any elements that might contain these strings as part of their content
    const allTextElements = document.querySelectorAll('*');
    allTextElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();
            
            // Check for partial matches and replace them
            const partialMappings = [
                { english: 'Add bookmark', key: 'addBookmarkDialogTitle' },
                { english: 'Title', key: 'bookmarkTitleInputLabel' },
                { english: 'Enter a title', key: 'bookmarkTitleInputPlaceholder' },
                { english: 'Cancel', key: 'bookmarkCancelButton' },
                { english: 'Add', key: 'bookmarkAddButton' }
            ];
            
            partialMappings.forEach(mapping => {
                if (text.includes(mapping.english) && t[mapping.key]) {
                    element.textContent = element.textContent.replace(mapping.english, t[mapping.key]);
                    console.log(`Partially translated "${mapping.english}" to "${t[mapping.key]}"`);
                }
            });
        }
    });
    
    console.log("Bookmark widget translation completed");
    
    // Additional aggressive translation for any remaining English text in Bookmark dialog
    setTimeout(() => {
        console.log("Performing additional Bookmark dialog translation...");
        
        // Strategy 1: Target specific elements by multiple selectors
        const specificSelectors = [
            // Dialog title
            '.esri-bookmarks__title',
            '.esri-bookmarks__dialog-title',
            '.esri-bookmarks [data-label="title"]',
            '.esri-bookmarks h1, .esri-bookmarks h2, .esri-bookmarks h3',
            '[class*="bookmark"][class*="title"]',
            
            // Title label
            '.esri-bookmarks__title-label',
            '.esri-bookmarks [data-label="title-label"]',
            '.esri-bookmarks label:contains("Title")',
            '[class*="title"][class*="label"]',
            
            // Input placeholder
            '.esri-bookmarks input[placeholder]',
            '.esri-bookmarks textarea[placeholder]',
            '[class*="bookmark"] input[placeholder]'
        ];
        
        specificSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const text = element.textContent.trim();
                    const placeholder = element.getAttribute('placeholder');
                    
                    if (text === 'Add bookmark' && t['addBookmarkDialogTitle']) {
                        element.textContent = t['addBookmarkDialogTitle'];
                        console.log(`SPECIFIC SELECTOR TRANSLATED: "Add bookmark" → "${t['addBookmarkDialogTitle']}"`);
                    } else if (text === 'Title' && t['bookmarkTitleInputLabel']) {
                        element.textContent = t['bookmarkTitleInputLabel'];
                        console.log(`SPECIFIC SELECTOR TRANSLATED: "Title" → "${t['bookmarkTitleInputLabel']}"`);
                    } else if (placeholder === 'Enter a title' && t['bookmarkTitleInputPlaceholder']) {
                        element.setAttribute('placeholder', t['bookmarkTitleInputPlaceholder']);
                        console.log(`SPECIFIC SELECTOR PLACEHOLDER: "Enter a title" → "${t['bookmarkTitleInputPlaceholder']}"`);
                    }
                });
            } catch (e) {
                // Ignore invalid selectors
            }
        });
        
        // Strategy 2: Global text scanning with priority for these specific elements
        const allBookmarkElements = document.querySelectorAll('*');
        allBookmarkElements.forEach(element => {
            if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                const text = element.textContent.trim();
                
                // Priority mappings for bookmark elements
                const priorityMappings = [
                    { english: 'Add bookmark', key: 'addBookmarkDialogTitle' },
                    { english: 'Title', key: 'bookmarkTitleInputLabel' },
                    { english: 'Enter a title', key: 'bookmarkTitleInputPlaceholder' },
                    { english: 'Cancel', key: 'bookmarkCancelButton' },
                    { english: 'Add', key: 'bookmarkAddButton' }
                ];
                
                priorityMappings.forEach(mapping => {
                    if (text === mapping.english && t[mapping.key]) {
                        element.textContent = t[mapping.key];
                        console.log(`PRIORITY BOOKMARK TRANSLATED: "${mapping.english}" → "${t[mapping.key]}"`);
                    }
                });
            }
        });
        
        // Strategy 3: Force translation by finding elements containing these texts
        const forceSelectors = [
            'label', 'span', 'div', 'button', 'option', 'h1', 'h2', 'h3'
        ];
        
        forceSelectors.forEach(tagName => {
            const elements = document.querySelectorAll(tagName);
            elements.forEach(element => {
                if (element.children.length === 0 && element.textContent) {
                    const text = element.textContent.trim();
                    
                    if (text === 'Add bookmark' && t['addBookmarkDialogTitle']) {
                        element.textContent = t['addBookmarkDialogTitle'];
                        console.log(`FORCE TRANSLATED: "Add bookmark" → "${t['addBookmarkDialogTitle']}"`);
                    } else if (text === 'Title' && t['bookmarkTitleInputLabel']) {
                        element.textContent = t['bookmarkTitleInputLabel'];
                        console.log(`FORCE TRANSLATED: "Title" → "${t['bookmarkTitleInputLabel']}"`);
                    } else if (text === 'Cancel' && t['bookmarkCancelButton']) {
                        element.textContent = t['bookmarkCancelButton'];
                        console.log(`FORCE TRANSLATED: "Cancel" → "${t['bookmarkCancelButton']}"`);
                    } else if (text === 'Add' && t['bookmarkAddButton']) {
                        element.textContent = t['bookmarkAddButton'];
                        console.log(`FORCE TRANSLATED: "Add" → "${t['bookmarkAddButton']}"`);
                    }
                }
            });
        });
        
        // Strategy 4: Translate placeholders specifically
        console.log("Translating placeholders...");
        const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        inputElements.forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                if (placeholder === 'Enter a title' && t['bookmarkTitleInputPlaceholder']) {
                    input.setAttribute('placeholder', t['bookmarkTitleInputPlaceholder']);
                    console.log(`PLACEHOLDER TRANSLATED: "Enter a title" → "${t['bookmarkTitleInputPlaceholder']}"`);
                }
            }
        });
        
        // Strategy 5: Continuous monitoring for Bookmark dialog elements
        let bookmarkTranslationInterval = setInterval(() => {
            console.log("Continuous Bookmark dialog translation monitoring...");
            
            // Check if Bookmark dialog is still open
            const bookmarkDialog = document.querySelector('.esri-bookmarks__dialog, .esri-bookmarks, [role="dialog"]');
            if (!bookmarkDialog) {
                console.log("Bookmark dialog closed, stopping monitoring");
                clearInterval(bookmarkTranslationInterval);
                return;
            }
            
            // Translate all elements in Bookmark dialog
            const allElements = document.querySelectorAll('*');
            let translatedCount = 0;
            
            allElements.forEach(element => {
                if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                    const text = element.textContent.trim();
                    
                    const continuousMappings = [
                        { english: 'Add bookmark', key: 'addBookmarkDialogTitle' },
                        { english: 'Title', key: 'bookmarkTitleInputLabel' },
                        { english: 'Enter a title', key: 'bookmarkTitleInputPlaceholder' },
                        { english: 'Cancel', key: 'bookmarkCancelButton' },
                        { english: 'Add', key: 'bookmarkAddButton' }
                    ];
                    
                    continuousMappings.forEach(mapping => {
                        if (text === mapping.english && t[mapping.key]) {
                            element.textContent = t[mapping.key];
                            translatedCount++;
                            console.log(`CONTINUOUS BOOKMARK TRANSLATED: "${mapping.english}" → "${t[mapping.key]}"`);
                        }
                    });
                }
            });
            
            // Also translate placeholders continuously
            const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
            inputElements.forEach(input => {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    if (placeholder === 'Enter a title' && t['bookmarkTitleInputPlaceholder']) {
                        input.setAttribute('placeholder', t['bookmarkTitleInputPlaceholder']);
                        translatedCount++;
                        console.log(`CONTINUOUS BOOKMARK PLACEHOLDER: "Enter a title" → "${t['bookmarkTitleInputPlaceholder']}"`);
                    }
                }
            });
            
            if (translatedCount > 0) {
                console.log(`Continuous bookmark translation: ${translatedCount} elements translated`);
            }
            
        }, 200); // Check every 200ms
        
        // Stop monitoring after 10 seconds
        setTimeout(() => {
            if (bookmarkTranslationInterval) {
                clearInterval(bookmarkTranslationInterval);
                console.log("Bookmark dialog translation monitoring stopped after 10 seconds");
            }
        }, 10000);
        
    }, 1000); // 1 second delay for additional translation
}

// Function to recreate ArcGIS widgets with new locale
function recreateWidgets() {
    const { map, view } = getMapAndView();
    if (!map || !view) {
        console.log("Map or view not available, skipping widget recreation");
        return;
    }
    
    console.log("Recreating widgets with new locale...");
    
    require([
        "esri/widgets/Home",
        "esri/widgets/Locate",
        "esri/widgets/Fullscreen",
        "esri/widgets/Search",
        "esri/widgets/BasemapGallery",
        "esri/widgets/LayerList",
        "esri/widgets/Measurement",
        "esri/widgets/Bookmarks",
        "esri/widgets/Print",
        "esri/widgets/Expand"
    ], function(Home, Locate, Fullscreen, Search, BasemapGallery, LayerList, Measurement, Bookmarks, Print, Expand) {
        
        // Clear existing widgets from UI
        view.ui.empty();
        
        // Recreate Home widget
        const home = new Home({ view });
        view.ui.add(home, { position: "top-left", index: 0 });
        window.widgets.home = home;
        
        // Recreate Locate widget
        const locate = new Locate({ view });
        view.ui.add(locate, { position: "top-left", index: 1 });
        window.widgets.locate = locate;
        
        // Recreate Fullscreen widget
        const fullscreen = new Fullscreen({ view });
        view.ui.add(fullscreen, { position: "top-right", index: 0 });
        window.widgets.fullscreen = fullscreen;
        
        // Recreate Basemap Gallery
        const basemapGallery = new BasemapGallery({ view });
        const basemapExpand = new Expand({
            view,
            content: basemapGallery,
            expanded: false,
            expandTooltip: translations[currentLanguage]['basemapTooltip'] || 'Basemap',
            expandIconClass: "esri-icon-basemap"
        });
        view.ui.add(basemapExpand, { position: "top-left", index: 3 });
        window.widgets.basemapExpand = basemapExpand;
        
        // Recreate Layer List
        const layerList = new LayerList({ view });
        const layerListExpand = new Expand({
            view,
            content: layerList,
            expanded: false,
            expandTooltip: translations[currentLanguage]['layerListTooltip'] || 'Layer list',
            expandIconClass: "esri-icon-layers"
        });
        view.ui.add(layerListExpand, { position: "top-left", index: 4 });
        window.widgets.layerListExpand = layerListExpand;
        
        // Recreate Measurement
        const measurement = new Measurement({ view });
        const measurementExpand = new Expand({
            view,
            content: measurement,
            expanded: false,
            expandTooltip: translations[currentLanguage]['measurementTooltip'] || 'Measure',
            expandIconClass: "esri-icon-measure"
        });
        view.ui.add(measurementExpand, { position: "top-left", index: 5 });
        window.widgets.measurementExpand = measurementExpand;
        
        // Recreate Bookmarks
        const bookmarks = new Bookmarks({ view, editingEnabled: true });
        const bookmarksExpand = new Expand({
            view,
            content: bookmarks,
            expanded: false,
            expandTooltip: translations[currentLanguage]['bookmarksTooltip'] || 'Bookmarks',
            expandIconClass: "esri-icon-bookmark"
        });
        view.ui.add(bookmarksExpand, { position: "top-left", index: 6 });
        window.widgets.bookmarksExpand = bookmarksExpand;
        
        // Recreate Search
        const searchWidget = new Search({ view });
        const searchExpand = new Expand({
            view,
            content: searchWidget,
            expanded: false,
            expandTooltip: translations[currentLanguage]['searchTooltip'] || 'Search',
            expandIconClass: "esri-icon-search"
        });
        view.ui.add(searchExpand, { position: "top-left", index: 7 });
        window.widgets.searchExpand = searchExpand;
        
        // Recreate Print widget with proper locale
        const print = new Print({
            view: view,
            printServiceUrl: "https://app.gdi.mk/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            // Set locale-specific properties
            title: translations[currentLanguage]['titleOfFilePlaceholder'] || 'Title of file',
            template: translations[currentLanguage]['letterAnsiALandscape'] || 'Letter ANSI A landscape'
        });
        const printExpand = new Expand({
            view: view,
            content: print,
            expanded: false,
            expandTooltip: translations[currentLanguage]['printTooltip'] || 'Print',
            expandIconClass: "esri-icon-printer"
        });
        view.ui.add(printExpand, "bottom-right");
        window.widgets.printExpand = printExpand;
        window.widgets.print = print;
        
        // Add event listeners for widget expansion
        setupWidgetEventListeners();
        
        console.log("Widgets recreated successfully");
        
        // Apply translations after recreation
        setTimeout(() => {
            updateArcGISWidgetTooltips();
            translateBookmarksForm();
            translateElevationProfile();
            translatePrintWidget();
        }, 500);
    });
}

// Function to setup widget event listeners
function setupWidgetEventListeners() {
    const widgets = getWidgets();
    
    if (widgets.searchExpand) {
        widgets.searchExpand.watch("expanded", function(isExpanded) {
            if (isExpanded) {
                setTimeout(updateUI, 100);
            }
        });
    }
    
    if (widgets.measurementExpand) {
        widgets.measurementExpand.watch("expanded", function(isExpanded) {
            if (isExpanded) {
                setTimeout(() => {
                    const measurementWidgetNode = widgets.measurementExpand.container.querySelector('.esri-measurement');
                    if (measurementWidgetNode && !measurementWidgetNode.querySelector('.custom-measure-buttons')) {
                        createMeasurementButtons(measurementWidgetNode);
                    }
                }, 100);
            }
        });
    }
    
    if (widgets.bookmarksExpand) {
        widgets.bookmarksExpand.watch("expanded", function(isExpanded) {
            if (isExpanded) {
                setTimeout(updateUI, 100);
            }
        });
    }
    
    if (widgets.printExpand) {
        widgets.printExpand.watch("expanded", function(isExpanded) {
            if (isExpanded) {
                setTimeout(translatePrintWidget, 100);
            }
        });
    }
}

// Main translate function - handles everything when language changes
function translate() {
    console.log("=== MAIN TRANSLATE FUNCTION STARTED ===");
    console.log("Current language:", currentLanguage);
    
    // Step 1: Set ArcGIS locale first (but don't recreate widgets)
    require(["esri/config"], function(esriConfig) {
        const localeMap = {
            'en': 'en',
            'mk': 'mk',
            'al': 'sq'
        };
        const arcGISLocale = localeMap[currentLanguage] || 'en';
        esriConfig.locale = arcGISLocale;
        console.log("ArcGIS locale set to:", arcGISLocale);
        
        // Step 2: Translate all existing widgets without recreating them
        console.log("Translating existing widgets...");
        
        // Call all translation functions immediately
        updateUI();
        translateMeasurementButtons();
        updateArcGISWidgetTooltips();
        translateElevationProfile();
        translateElevationButtons();
        translateElevationProfileWidget();
        translateBookmarksForm();
        translatePrintWidget();
        
        // Add specific calls for Sketch and CoordinateConversion widgets
        translateSketchWidget();
        translateCoordinateConversionWidget();
        
        // Step 3: Aggressive text translation
        setTimeout(() => {
            console.log("Starting aggressive text translation...");
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                    const text = element.textContent.trim();
                    
                    // All possible English text mappings
                    const textMappings = [
                        // Print/Export Dialog
                        { english: 'Print', key: 'printTooltip' },
                        { english: 'Export', key: 'exportDialogTitle' },
                        { english: 'Layout', key: 'layoutTab' },
                        { english: 'Map only', key: 'mapOnlyTab' },
                        { english: 'Exports', key: 'exportsTab' },
                        { english: 'Template', key: 'templateLabel' },
                        { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                        { english: 'Show print area', key: 'showPrintAreaLabel' },
                        { english: 'File format', key: 'fileFormatLabel' },
                        { english: 'PDF', key: 'pdfFormat' },
                        { english: 'Advanced options', key: 'advancedOptionsLabel' },
                        { english: 'Set scale', key: 'setScaleLabel' },
                        { english: 'DPI', key: 'dpiLabel' },
                        { english: 'Include legend', key: 'includeLegendLabel' },
                        { english: 'Include attribution', key: 'includeAttributionLabel' },
                        { english: 'File name', key: 'fileNameLabel' },
                        { english: 'Width', key: 'widthLabel' },
                        { english: 'Height', key: 'heightLabel' },
                        { english: 'No exported files', key: 'noExportedFilesText' },
                        { english: 'Cancel', key: 'bookmarkCancelButton' },
                        { english: 'Add', key: 'bookmarkAddButton' },
                        
                        // Bookmarks
                        { english: 'Add bookmark', key: 'addBookmarkButtonText' },
                        { english: 'Title', key: 'bookmarkTitleLabel' },
                        { english: 'Title of file', key: 'titleOfFilePlaceholder' },
                        { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                        { english: 'No bookmarks', key: 'noBookmarksText' },
                        { english: 'Add bookmarks to save locations', key: 'addBookmarksHintText' },
                        
                        // Elevation Profile
                        { english: 'Units', key: 'unitsLabel' },
                        { english: 'Metric', key: 'metricValue' },
                        { english: 'Uniform chart scaling', key: 'uniformChartScalingLabel' },
                        { english: 'Select line', key: 'selectLineButtonText' },
                        { english: 'New profile', key: 'newProfileButtonText' },
                        
                        // Sketch Widget
                        { english: 'Draw a point', key: 'drawPointTooltip' },
                        { english: 'Draw a polyline', key: 'drawPolylineTooltip' },
                        { english: 'Draw a polygon', key: 'drawPolygonTooltip' },
                        { english: 'Draw a circle', key: 'drawCircleTooltip' },
                        { english: 'Draw a rectangle', key: 'drawRectangleTooltip' },
                        { english: 'Select by lasso', key: 'selectByLassoTooltip' },
                        { english: 'Select by rectangle', key: 'selectByRectangleTooltip' },
                        { english: 'Select feature', key: 'selectFeatureTooltip' },
                        
                        // Coordinate Conversion Widget
                        { english: 'XY', key: 'xyConversionOutputTooltip' },
                        { english: 'Latitude/Longitude', key: 'latLongTooltip' },
                        { english: 'MGRS', key: 'mgrsTooltip' },
                        { english: 'USNG', key: 'usngTooltip' },
                        { english: 'UTM', key: 'utmTooltip' },
                        
                        // Other common elements
                        { english: 'Powered by Esri', key: 'poweredByEsri' }
                    ];
                    
                    textMappings.forEach(mapping => {
                        if (text === mapping.english && translations[currentLanguage][mapping.key]) {
                            element.textContent = translations[currentLanguage][mapping.key];
                            console.log(`TRANSLATED: "${mapping.english}" → "${translations[currentLanguage][mapping.key]}"`);
                        }
                    });
                }
            });
            
            // Step 4: Translate placeholders
            const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
            inputElements.forEach(input => {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder) {
                    const placeholderMappings = [
                        { english: 'File name', key: 'fileNamePlaceholder' },
                        { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                        { english: 'Title of file', key: 'titleOfFilePlaceholder' }
                    ];
                    
                    placeholderMappings.forEach(mapping => {
                        if (placeholder === mapping.english && translations[currentLanguage][mapping.key]) {
                            input.setAttribute('placeholder', translations[currentLanguage][mapping.key]);
                            console.log(`TRANSLATED PLACEHOLDER: "${mapping.english}" → "${translations[currentLanguage][mapping.key]}"`);
                        }
                    });
                }
            });
            
            // Step 5: Start continuous translation for any remaining elements
            startContinuousTranslation();
            
            console.log("=== MAIN TRANSLATE FUNCTION COMPLETE ===");
        }, 200); // Short delay for aggressive translation
        
    });
}

// Comprehensive translation function - triggered by language button clicks
function translateEverything() {
    console.log("=== STARTING COMPREHENSIVE TRANSLATION ===");
    
    // 1. Update basic UI elements
    updateUI();
    
    // 2. Translate measurement buttons
    translateMeasurementButtons();
    
    // 3. Update ArcGIS widget tooltips
    updateArcGISWidgetTooltips();
    
    // 4. Translate elevation profile elements
    translateElevationProfile();
    translateElevationButtons();
    translateElevationProfileWidget();
    
    // 5. Translate bookmarks form
    translateBookmarksForm();
    
    // 6. Translate print widget
    translatePrintWidget();
    
    // 7. Start continuous translation for any remaining elements
    startContinuousTranslation();
    
    // 8. Force immediate translation of all text elements
    setTimeout(() => {
        console.log("=== FORCING IMMEDIATE TRANSLATION ===");
        
        // Translate all text content
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                const text = element.textContent.trim();
                
                // Comprehensive mapping of ALL English text to translations
                const textMappings = [
                    // Print/Export Dialog
                    { english: 'Print', key: 'printTooltip' },
                    { english: 'Export', key: 'exportDialogTitle' },
                    { english: 'Layout', key: 'layoutTab' },
                    { english: 'Map only', key: 'mapOnlyTab' },
                    { english: 'Exports', key: 'exportsTab' },
                    { english: 'Template', key: 'templateLabel' },
                    { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                    { english: 'Show print area', key: 'showPrintAreaLabel' },
                    { english: 'File format', key: 'fileFormatLabel' },
                    { english: 'PDF', key: 'pdfFormat' },
                    { english: 'Advanced options', key: 'advancedOptionsLabel' },
                    { english: 'Set scale', key: 'setScaleLabel' },
                    { english: 'DPI', key: 'dpiLabel' },
                    { english: 'Include legend', key: 'includeLegendLabel' },
                    { english: 'Include attribution', key: 'includeAttributionLabel' },
                    { english: 'File name', key: 'fileNameLabel' },
                    { english: 'Width', key: 'widthLabel' },
                    { english: 'Height', key: 'heightLabel' },
                    { english: 'No exported files', key: 'noExportedFilesText' },
                    { english: 'Cancel', key: 'bookmarkCancelButton' },
                    { english: 'Add', key: 'bookmarkAddButton' },
                    
                    // Bookmarks
                    { english: 'Add bookmark', key: 'addBookmarkButtonText' },
                    { english: 'Title', key: 'bookmarkTitleLabel' },
                    { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                    { english: 'No bookmarks', key: 'noBookmarksText' },
                    { english: 'Add bookmarks to save locations', key: 'addBookmarksHintText' },
                    
                    // Elevation Profile
                    { english: 'Units', key: 'unitsLabel' },
                    { english: 'Metric', key: 'metricValue' },
                    { english: 'Uniform chart scaling', key: 'uniformChartScalingLabel' },
                    { english: 'Select line', key: 'selectLineButtonText' },
                    { english: 'New profile', key: 'newProfileButtonText' },
                    
                    // Other common elements
                    { english: 'XY', key: 'xyConversionOutputTooltip' },
                    { english: 'Powered by Esri', key: 'poweredByEsri' }
                ];
                
                textMappings.forEach(mapping => {
                    if (text === mapping.english && translations[currentLanguage][mapping.key]) {
                        element.textContent = translations[currentLanguage][mapping.key];
                        console.log(`TRANSLATED: "${mapping.english}" → "${translations[currentLanguage][mapping.key]}"`);
                    }
                });
            }
        });
        
        // Translate all placeholders
        const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        inputElements.forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                const placeholderMappings = [
                    { english: 'File name', key: 'fileNamePlaceholder' },
                    { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                    { english: 'Title of file', key: 'titleOfFilePlaceholder' }
                ];
                
                placeholderMappings.forEach(mapping => {
                    if (placeholder === mapping.english && translations[currentLanguage][mapping.key]) {
                        input.setAttribute('placeholder', translations[currentLanguage][mapping.key]);
                        console.log(`TRANSLATED PLACEHOLDER: "${mapping.english}" → "${translations[currentLanguage][mapping.key]}"`);
                    }
                });
            }
        });
        
        // Call specific translation functions again
        translateBookmarksForm();
        translatePrintWidget();
        translateElevationProfile();
        translateElevationProfileWidget();
        
        console.log("=== COMPREHENSIVE TRANSLATION COMPLETE ===");
    }, 200);
    
    console.log("=== COMPREHENSIVE TRANSLATION INITIATED ===");
}

// Function to translate Sketch widget specifically
function translateSketchWidget() {
    console.log("Translating Sketch widget...");
    
    if (!translations || !translations[currentLanguage]) {
        return;
    }
    
    const t = translations[currentLanguage];
    
    // Translate Sketch widget tooltips
    const sketchTooltips = [
        { selector: '.esri-sketch__tool--point', key: 'drawPointTooltip' },
        { selector: '.esri-sketch__tool--polyline', key: 'drawPolylineTooltip' },
        { selector: '.esri-sketch__tool--polygon', key: 'drawPolygonTooltip' },
        { selector: '.esri-sketch__tool--circle', key: 'drawCircleTooltip' },
        { selector: '.esri-sketch__tool--rectangle', key: 'drawRectangleTooltip' },
        { selector: '.esri-sketch__tool--lasso', key: 'selectByLassoTooltip' },
        { selector: '.esri-sketch__tool--rectangle-select', key: 'selectByRectangleTooltip' },
        { selector: '.esri-sketch__tool--select', key: 'selectFeatureTooltip' }
    ];
    
    sketchTooltips.forEach(tooltip => {
        const elements = document.querySelectorAll(tooltip.selector);
        elements.forEach(element => {
            if (t[tooltip.key]) {
                element.setAttribute('title', t[tooltip.key]);
                element.setAttribute('aria-label', t[tooltip.key]);
                console.log(`Sketch tooltip translated: ${tooltip.key} → ${t[tooltip.key]}`);
            }
        });
    });
    
    // Also translate any text content in Sketch widget
    const sketchElements = document.querySelectorAll('.esri-sketch *');
    sketchElements.forEach(element => {
        if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
            const text = element.textContent.trim();
            
            // Sketch-specific text mappings
            const sketchTextMappings = [
                { english: 'Draw a point', key: 'drawPointTooltip' },
                { english: 'Draw a polyline', key: 'drawPolylineTooltip' },
                { english: 'Draw a polygon', key: 'drawPolygonTooltip' },
                { english: 'Draw a circle', key: 'drawCircleTooltip' },
                { english: 'Draw a rectangle', key: 'drawRectangleTooltip' },
                { english: 'Select by lasso', key: 'selectByLassoTooltip' },
                { english: 'Select by rectangle', key: 'selectByRectangleTooltip' },
                { english: 'Select feature', key: 'selectFeatureTooltip' }
            ];
            
            sketchTextMappings.forEach(mapping => {
                if (text === mapping.english && t[mapping.key]) {
                    element.textContent = t[mapping.key];
                    console.log(`Sketch text translated: "${mapping.english}" → "${t[mapping.key]}"`);
                }
            });
        }
    });
}

// Function to translate CoordinateConversion widget specifically
function translateCoordinateConversionWidget() {
    console.log("Translating CoordinateConversion widget...");
    
    if (!translations || !translations[currentLanguage]) {
        return;
    }
    
    const t = translations[currentLanguage];
    
    // Translate Coordinate Conversion widget elements
    const coordinateElements = document.querySelectorAll('.esri-coordinate-conversion');
    coordinateElements.forEach(element => {
        // Translate the "XY" label
        const xyLabel = element.querySelector('.esri-coordinate-conversion__conversion-type');
        if (xyLabel && t['xyConversionOutputTooltip']) {
            xyLabel.textContent = t['xyConversionOutputTooltip'];
            console.log(`Coordinate widget label translated: XY → ${t['xyConversionOutputTooltip']}`);
        }
        
        // Translate any other text elements
        const textElements = element.querySelectorAll('*');
        textElements.forEach(textElement => {
            if (textElement.children.length === 0 && textElement.textContent && textElement.textContent.trim()) {
                const text = textElement.textContent.trim();
                
                // Coordinate-specific text mappings
                const coordinateTextMappings = [
                    { english: 'XY', key: 'xyConversionOutputTooltip' },
                    { english: 'Latitude/Longitude', key: 'latLongTooltip' },
                    { english: 'MGRS', key: 'mgrsTooltip' },
                    { english: 'USNG', key: 'usngTooltip' },
                    { english: 'UTM', key: 'utmTooltip' }
                ];
                
                coordinateTextMappings.forEach(mapping => {
                    if (text === mapping.english && t[mapping.key]) {
                        textElement.textContent = t[mapping.key];
                        console.log(`Coordinate text translated: "${mapping.english}" → "${t[mapping.key]}"`);
                    }
                });
            }
        });
    });
}

// Function to specifically translate Elevation Profile widget elements
function translateElevationProfileWidget() {
    console.log("Translating Elevation Profile widget...");
    
    if (!translations || !translations[currentLanguage]) {
        return;
    }
    
    const t = translations[currentLanguage];
    
    // Translate Elevation Profile widget elements
    const elevationElements = document.querySelectorAll('.esri-elevation-profile');
    elevationElements.forEach(element => {
        // Translate "Units" label
        const unitsLabel = element.querySelector('.esri-elevation-profile__units-label');
        if (unitsLabel && t['unitsLabel']) {
            unitsLabel.textContent = t['unitsLabel'];
        }
        
        // Translate "Metric" value
        const metricValue = element.querySelector('.esri-elevation-profile__units-value');
        if (metricValue && t['metricValue']) {
            metricValue.textContent = t['metricValue'];
        }
        
        // Translate "Uniform chart scaling" label
        const uniformScalingLabel = element.querySelector('.esri-elevation-profile__uniform-scaling-label');
        if (uniformScalingLabel && t['uniformChartScalingLabel']) {
            uniformScalingLabel.textContent = t['uniformChartScalingLabel'];
        }
    });
    
    // Also try to translate any elevation-related elements globally
    console.log("Trying to translate any elevation-related elements...");
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
            const text = element.textContent.trim();
            
            // Elevation-specific text mappings
            const elevationTextMappings = [
                { english: 'Units', key: 'unitsLabel' },
                { english: 'Metric', key: 'metricValue' },
                { english: 'Uniform chart scaling', key: 'uniformChartScalingLabel' },
                { english: 'Select line', key: 'selectLineButtonText' },
                { english: 'New profile', key: 'newProfileButtonText' },
                { english: 'Ground Elevation', key: 'groundElevationLabel' }
            ];
            
            elevationTextMappings.forEach(mapping => {
                if (text === mapping.english && t[mapping.key]) {
                    element.textContent = t[mapping.key];
                    console.log(`ELEVATION TRANSLATED: "${mapping.english}" → "${t[mapping.key]}"`);
                }
            });
        }
    });
}

// Function to create measurement buttons
function createMeasurementButtons(measurementWidgetNode) {
    const toolButtonsDiv = document.createElement('div');
    toolButtonsDiv.className = 'custom-measure-buttons';
    toolButtonsDiv.style.display = 'flex';
    toolButtonsDiv.style.flexDirection = 'column';
    toolButtonsDiv.style.alignItems = 'stretch';
    toolButtonsDiv.style.gap = '4px';
    toolButtonsDiv.style.marginBottom = '8px';

    const label = document.createElement('div');
    label.textContent = translations[currentLanguage]['startMeasurement'] || translations['en']['startMeasurement'];
    label.style.fontSize = '12px';
    label.style.marginBottom = '4px';
    label.style.color = '#333';
    toolButtonsDiv.appendChild(label);

    const distanceBtn = document.createElement('button');
    const distanceIcon = '📏 ';
    distanceBtn.textContent = distanceIcon + (translations[currentLanguage]['distance'] || translations['en']['distance']);
    distanceBtn.className = 'esri-widget--button';
    distanceBtn.style.fontSize = '12px';
    distanceBtn.style.padding = '4px 8px';
    distanceBtn.onclick = () => {
        const widgets = getWidgets();
        widgets.measurementExpand.content.clear();
        widgets.measurementExpand.content.activeTool = 'direct-line';
        widgets.measurementExpand.content.start();
    };

    const areaBtn = document.createElement('button');
    const areaIcon = '⬛ ';
    areaBtn.textContent = areaIcon + (translations[currentLanguage]['area'] || translations['en']['area']);
    areaBtn.className = 'esri-widget--button';
    areaBtn.style.fontSize = '12px';
    areaBtn.style.padding = '4px 8px';
    areaBtn.onclick = () => {
        const widgets = getWidgets();
        widgets.measurementExpand.content.activeTool = 'area';
        widgets.measurementExpand.content.start();
    };

    toolButtonsDiv.appendChild(distanceBtn);
    toolButtonsDiv.appendChild(areaBtn);

    const clearBtn = document.createElement('button');
    const clearIcon = '🗑️ ';
    clearBtn.textContent = clearIcon + (translations[currentLanguage]['clear'] || translations['en']['clear']);
    clearBtn.className = 'esri-widget--button';
    clearBtn.style.fontSize = '12px';
    clearBtn.style.padding = '4px 8px';
    clearBtn.style.marginTop = '8px';
    clearBtn.onclick = () => {
        const widgets = getWidgets();
        widgets.measurementExpand.content.clear();
    };
    toolButtonsDiv.appendChild(clearBtn);

    measurementWidgetNode.insertBefore(toolButtonsDiv, measurementWidgetNode.firstChild);
    translateMeasurementButtons();
}

// Function to specifically translate Print widget elements
function translatePrintWidget() {
    if (!translations || !translations[currentLanguage]) return;
    
    const t = translations[currentLanguage];
    
    // Direct targeting of Print dialog elements based on what we see in the DOM
    console.log("Direct Print dialog translation starting...");
    
    // Target all calcite-label elements (which contain the labels we see)
    const calciteLabels = document.querySelectorAll('calcite-label');
    calciteLabels.forEach(label => {
        // Only translate if this is a simple text label, not a container with inputs
        if (label.children.length === 0 || label.children.length === 1) {
            const text = label.textContent.trim();
            console.log("Found calcite-label with text:", text);
            
            if (text === 'File name' && t['fileNameLabel']) {
                // Find the text node and replace only that
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'File name') {
                        textNode.textContent = textNode.textContent.replace('File name', t['fileNameLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "File name" → "${t['fileNameLabel']}"`);
                    }
                });
            } else if (text === 'File format' && t['fileFormatLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'File format') {
                        textNode.textContent = textNode.textContent.replace('File format', t['fileFormatLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "File format" → "${t['fileFormatLabel']}"`);
                    }
                });
            } else if (text === 'Width' && t['widthLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Width') {
                        textNode.textContent = textNode.textContent.replace('Width', t['widthLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Width" → "${t['widthLabel']}"`);
                    }
                });
            } else if (text === 'Height' && t['heightLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Height') {
                        textNode.textContent = textNode.textContent.replace('Height', t['heightLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Height" → "${t['heightLabel']}"`);
                    }
                });
            } else if (text === 'Show print area' && t['showPrintAreaLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Show print area') {
                        textNode.textContent = textNode.textContent.replace('Show print area', t['showPrintAreaLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Show print area" → "${t['showPrintAreaLabel']}"`);
                    }
                });
            } else if (text === 'Advanced options' && t['advancedOptionsLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Advanced options') {
                        textNode.textContent = textNode.textContent.replace('Advanced options', t['advancedOptionsLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Advanced options" → "${t['advancedOptionsLabel']}"`);
                    }
                });
            } else if (text === 'Template' && t['templateLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Template') {
                        textNode.textContent = textNode.textContent.replace('Template', t['templateLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Template" → "${t['templateLabel']}"`);
                    }
                });
            } else if (text === 'Set scale' && t['setScaleLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Set scale') {
                        textNode.textContent = textNode.textContent.replace('Set scale', t['setScaleLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Set scale" → "${t['setScaleLabel']}"`);
                    }
                });
            } else if (text === 'Author' && t['authorLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Author') {
                        textNode.textContent = textNode.textContent.replace('Author', t['authorLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Author" → "${t['authorLabel']}"`);
                    }
                });
            } else if (text === 'Copyright' && t['copyrightLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Copyright') {
                        textNode.textContent = textNode.textContent.replace('Copyright', t['copyrightLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Copyright" → "${t['copyrightLabel']}"`);
                    }
                });
            } else if (text === 'DPI' && t['dpiLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'DPI') {
                        textNode.textContent = textNode.textContent.replace('DPI', t['dpiLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "DPI" → "${t['dpiLabel']}"`);
                    }
                });
            } else if (text === 'Include legend' && t['includeLegendLabel']) {
                const textNodes = Array.from(label.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(textNode => {
                    if (textNode.textContent.trim() === 'Include legend') {
                        textNode.textContent = textNode.textContent.replace('Include legend', t['includeLegendLabel']);
                        console.log(`CALCITE LABEL TRANSLATED: "Include legend" → "${t['includeLegendLabel']}"`);
                    }
                });
            }
        }
    });
    
    // Target all span elements that might contain the labels
    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
        // Only translate if this is a simple text span, not a container with inputs
        if (span.children.length === 0) {
            const text = span.textContent.trim();
            if (text) {
                console.log("Found span with text:", text);
                
                if (text === 'File name' && t['fileNameLabel']) {
                    span.textContent = t['fileNameLabel'];
                    console.log(`SPAN TRANSLATED: "File name" → "${t['fileNameLabel']}"`);
                } else if (text === 'File format' && t['fileFormatLabel']) {
                    span.textContent = t['fileFormatLabel'];
                    console.log(`SPAN TRANSLATED: "File format" → "${t['fileFormatLabel']}"`);
                } else if (text === 'Width' && t['widthLabel']) {
                    span.textContent = t['widthLabel'];
                    console.log(`SPAN TRANSLATED: "Width" → "${t['widthLabel']}"`);
                } else if (text === 'Height' && t['heightLabel']) {
                    span.textContent = t['heightLabel'];
                    console.log(`SPAN TRANSLATED: "Height" → "${t['heightLabel']}"`);
                } else if (text === 'Show print area' && t['showPrintAreaLabel']) {
                    span.textContent = t['showPrintAreaLabel'];
                    console.log(`SPAN TRANSLATED: "Show print area" → "${t['showPrintAreaLabel']}"`);
                } else if (text === 'Advanced options' && t['advancedOptionsLabel']) {
                    span.textContent = t['advancedOptionsLabel'];
                    console.log(`SPAN TRANSLATED: "Advanced options" → "${t['advancedOptionsLabel']}"`);
                } else if (text === 'Template' && t['templateLabel']) {
                    span.textContent = t['templateLabel'];
                    console.log(`SPAN TRANSLATED: "Template" → "${t['templateLabel']}"`);
                } else if (text === 'Set scale' && t['setScaleLabel']) {
                    span.textContent = t['setScaleLabel'];
                    console.log(`SPAN TRANSLATED: "Set scale" → "${t['setScaleLabel']}"`);
                } else if (text === 'Author' && t['authorLabel']) {
                    span.textContent = t['authorLabel'];
                    console.log(`SPAN TRANSLATED: "Author" → "${t['authorLabel']}"`);
                } else if (text === 'Copyright' && t['copyrightLabel']) {
                    span.textContent = t['copyrightLabel'];
                    console.log(`SPAN TRANSLATED: "Copyright" → "${t['copyrightLabel']}"`);
                } else if (text === 'DPI' && t['dpiLabel']) {
                    span.textContent = t['dpiLabel'];
                    console.log(`SPAN TRANSLATED: "DPI" → "${t['dpiLabel']}"`);
                } else if (text === 'Include legend' && t['includeLegendLabel']) {
                    span.textContent = t['includeLegendLabel'];
                    console.log(`SPAN TRANSLATED: "Include legend" → "${t['includeLegendLabel']}"`);
                }
            }
        }
    });
    
    // Target all div elements that might contain the labels
    const divs = document.querySelectorAll('div');
    divs.forEach(div => {
        const text = div.textContent.trim();
        if (text && div.children.length === 0) {
            console.log("Found div with text:", text);
            
            if (text === 'File name' && t['fileNameLabel']) {
                div.textContent = t['fileNameLabel'];
                console.log(`DIV TRANSLATED: "File name" → "${t['fileNameLabel']}"`);
            } else if (text === 'File format' && t['fileFormatLabel']) {
                div.textContent = t['fileFormatLabel'];
                console.log(`DIV TRANSLATED: "File format" → "${t['fileFormatLabel']}"`);
            } else if (text === 'Width' && t['widthLabel']) {
                div.textContent = t['widthLabel'];
                console.log(`DIV TRANSLATED: "Width" → "${t['widthLabel']}"`);
            } else if (text === 'Height' && t['heightLabel']) {
                div.textContent = t['heightLabel'];
                console.log(`DIV TRANSLATED: "Height" → "${t['heightLabel']}"`);
            } else if (text === 'Show print area' && t['showPrintAreaLabel']) {
                div.textContent = t['showPrintAreaLabel'];
                console.log(`DIV TRANSLATED: "Show print area" → "${t['showPrintAreaLabel']}"`);
            } else if (text === 'Advanced options' && t['advancedOptionsLabel']) {
                div.textContent = t['advancedOptionsLabel'];
                console.log(`DIV TRANSLATED: "Advanced options" → "${t['advancedOptionsLabel']}"`);
            } else if (text === 'Template' && t['templateLabel']) {
                div.textContent = t['templateLabel'];
                console.log(`DIV TRANSLATED: "Template" → "${t['templateLabel']}"`);
            }
        }
    });
    
    // Target Print widget dialog elements - be more comprehensive
    const printDialog = document.querySelector('.esri-print__dialog, .esri-print, [role="dialog"]');
    if (!printDialog) {
        console.log("Print dialog not found, trying alternative selectors...");
        // Try alternative selectors
        const alternativeSelectors = [
            '.esri-print',
            '.esri-print__container',
            '.esri-print__dialog',
            '[class*="print"]',
            '[class*="export"]'
        ];
        
        for (const selector of alternativeSelectors) {
            const found = document.querySelector(selector);
            if (found) {
                console.log("Found print dialog with selector:", selector);
                break;
            }
        }
        
        // If still not found, try to translate any print-related elements
        console.log("Trying to translate any print-related elements...");
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                const text = element.textContent.trim();
                
                // Print-specific text mappings
                const printTextMappings = [
                    { english: 'Print', key: 'printTooltip' },
                    { english: 'Export', key: 'exportDialogTitle' },
                    { english: 'Layout', key: 'layoutTab' },
                    { english: 'Map only', key: 'mapOnlyTab' },
                    { english: 'Exports', key: 'exportsTab' },
                    { english: 'Template', key: 'templateLabel' },
                    { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                    { english: 'Show print area', key: 'showPrintAreaLabel' },
                    { english: 'File format', key: 'fileFormatLabel' },
                    { english: 'PDF', key: 'pdfFormat' },
                    { english: 'Advanced options', key: 'advancedOptionsLabel' },
                    { english: 'Set scale', key: 'setScaleLabel' },
                    { english: 'DPI', key: 'dpiLabel' },
                    { english: 'Include legend', key: 'includeLegendLabel' },
                    { english: 'Include attribution', key: 'includeAttributionLabel' },
                    { english: 'File name', key: 'fileNameLabel' },
                    { english: 'Width', key: 'widthLabel' },
                    { english: 'Height', key: 'heightLabel' },
                    { english: 'No exported files', key: 'noExportedFilesText' },
                    { english: 'Cancel', key: 'bookmarkCancelButton' },
                    { english: 'Add', key: 'bookmarkAddButton' },
                    { english: 'Title', key: 'titleLabel' },
                    { english: 'Title of file', key: 'titleOfFilePlaceholder' },
                    { english: 'Enter a title', key: 'titleOfFilePlaceholder' }
                ];
                
                printTextMappings.forEach(mapping => {
                    if (text === mapping.english && t[mapping.key]) {
                        element.textContent = t[mapping.key];
                        console.log(`PRINT TRANSLATED: "${mapping.english}" → "${t[mapping.key]}"`);
                    }
                });
            }
        });
        
        return;
    }
    
    // Translate dialog title
    const dialogTitle = printDialog.querySelector('.esri-print__title, .esri-print__dialog-title');
    if (dialogTitle && t['exportDialogTitle']) {
        dialogTitle.textContent = t['exportDialogTitle'];
    }
    
    // Translate tab labels
    const tabLabels = printDialog.querySelectorAll('.esri-print__tab-label');
    tabLabels.forEach((tab, index) => {
        if (index === 0 && t['layoutTab']) {
            tab.textContent = t['layoutTab'];
        } else if (index === 1 && t['mapOnlyTab']) {
            tab.textContent = t['mapOnlyTab'];
        } else if (index === 2 && t['exportsTab']) {
            tab.textContent = t['exportsTab'];
        }
    });
    
    // Translate form labels
    const titleLabel = printDialog.querySelector('.esri-print__title-label');
    if (titleLabel && t['titleLabel']) {
        titleLabel.textContent = t['titleLabel'];
    }
    
    const titleInput = printDialog.querySelector('.esri-print__title-input');
    if (titleInput && t['titleOfFilePlaceholder']) {
        titleInput.placeholder = t['titleOfFilePlaceholder'];
    }
    
    const templateLabel = printDialog.querySelector('.esri-print__template-label');
    if (templateLabel && t['templateLabel']) {
        templateLabel.textContent = t['templateLabel'];
    }
    
    const showPrintAreaLabel = printDialog.querySelector('.esri-print__show-print-area-label');
    if (showPrintAreaLabel && t['showPrintAreaLabel']) {
        showPrintAreaLabel.textContent = t['showPrintAreaLabel'];
    }
    
    const fileFormatLabel = printDialog.querySelector('.esri-print__file-format-label');
    if (fileFormatLabel && t['fileFormatLabel']) {
        fileFormatLabel.textContent = t['fileFormatLabel'];
    }
    
    const advancedOptionsLabel = printDialog.querySelector('.esri-print__advanced-options-label');
    if (advancedOptionsLabel && t['advancedOptionsLabel']) {
        advancedOptionsLabel.textContent = t['advancedOptionsLabel'];
    }
    
    // Translate export button
    const exportButton = printDialog.querySelector('.esri-print__export-button, .esri-print__submit-button');
    if (exportButton && t['exportButtonText']) {
        exportButton.textContent = t['exportButtonText'];
    }
    
    // Translate template options
    const templateOptions = printDialog.querySelectorAll('.esri-print__template-option');
    templateOptions.forEach(option => {
        const text = option.textContent.trim();
        if (text === 'Letter ANSI A landscape' && t['letterAnsiALandscape']) {
            option.textContent = t['letterAnsiALandscape'];
        }
    });
    
    // Also try to find elements by content matching for any missed elements
    const allElements = printDialog.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();
            
            // Map English text to translation keys
            const textMappings = [
                { english: 'Template', key: 'templateLabel' },
                { english: 'Show print area', key: 'showPrintAreaLabel' },
                { english: 'File format', key: 'fileFormatLabel' },
                { english: 'Advanced options', key: 'advancedOptionsLabel' },
                { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                { english: 'PDF', key: 'pdfFormat' },
                { english: 'Print', key: 'printTooltip' },
                { english: 'Expand', key: 'collapseTooltip' },
                { english: 'Layout', key: 'layoutTab' },
                { english: 'Map only', key: 'mapOnlyTab' },
                { english: 'Exports', key: 'exportsTab' },
                { english: 'Export', key: 'exportDialogTitle' }
            ];
            
            textMappings.forEach(mapping => {
                if (text === mapping.english && t[mapping.key]) {
                    element.textContent = t[mapping.key];
                    console.log(`Translated "${mapping.english}" to "${t[mapping.key]}"`);
                }
            });
        }
    });
    
    // Also try to translate any elements that might contain these strings as part of their content
    const allTextElements = document.querySelectorAll('*');
    allTextElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();
            
            // Check for partial matches and replace them
            const partialMappings = [
                { english: 'Template', key: 'templateLabel' },
                { english: 'Show print area', key: 'showPrintAreaLabel' },
                { english: 'File format', key: 'fileFormatLabel' },
                { english: 'Advanced options', key: 'advancedOptionsLabel' },
                { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                { english: 'PDF', key: 'pdfFormat' },
                { english: 'Print', key: 'printTooltip' },
                { english: 'Expand', key: 'collapseTooltip' },
                { english: 'Layout', key: 'layoutTab' },
                { english: 'Map only', key: 'mapOnlyTab' },
                { english: 'Exports', key: 'exportsTab' },
                { english: 'Export', key: 'exportDialogTitle' }
            ];
            
            partialMappings.forEach(mapping => {
                if (text.includes(mapping.english) && t[mapping.key]) {
                    element.textContent = element.textContent.replace(mapping.english, t[mapping.key]);
                    console.log(`Partially translated "${mapping.english}" to "${t[mapping.key]}"`);
                }
            });
        }
    });
    
    // Target specific elements that might be missed
    const expandButtons = printDialog.querySelectorAll('.esri-expand__toggle, .esri-expand__collapse');
    expandButtons.forEach(button => {
        const title = button.getAttribute('title');
        const ariaLabel = button.getAttribute('aria-label');
        const text = button.textContent.trim();
        
        if (title === 'Expand' && t['collapseTooltip']) {
            button.setAttribute('title', t['collapseTooltip']);
        }
        if (ariaLabel === 'Expand' && t['collapseTooltip']) {
            button.setAttribute('aria-label', t['collapseTooltip']);
        }
        if (text === 'Expand' && t['collapseTooltip']) {
            button.textContent = t['collapseTooltip'];
        }
    });
    
    // Target "Powered by Esri" text
    const poweredByElements = printDialog.querySelectorAll('*');
    poweredByElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();
            if (text === 'Powered by Esri') {
                // We don't have a translation for this, but we can hide it or replace it
                element.style.display = 'none'; // Hide it for now
            }
        }
    });
    
    console.log("Print widget translation completed");
    
    // Additional aggressive translation for any remaining English text in Print dialog
    setTimeout(() => {
        console.log("Performing additional Print dialog translation...");
        
        // Strategy 1: Target specific elements by multiple selectors
        const specificSelectors = [
            // Template label
            '.esri-print__template-label',
            '.esri-print [data-label="template"]',
            '.esri-print label:contains("Template")',
            '[class*="template"][class*="label"]',
            
            // Show print area label
            '.esri-print__show-print-area-label',
            '.esri-print [data-label="show-print-area"]',
            '.esri-print label:contains("Show print area")',
            '[class*="print-area"][class*="label"]',
            
            // File format label
            '.esri-print__file-format-label',
            '.esri-print [data-label="file-format"]',
            '.esri-print label:contains("File format")',
            '[class*="file-format"][class*="label"]',
            
            // Advanced options label
            '.esri-print__advanced-options-label',
            '.esri-print [data-label="advanced-options"]',
            '.esri-print label:contains("Advanced options")',
            '[class*="advanced-options"][class*="label"]'
        ];
        
        specificSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const text = element.textContent.trim();
                    if (text === 'Template' && t['templateLabel']) {
                        element.textContent = t['templateLabel'];
                        console.log(`SPECIFIC SELECTOR TRANSLATED: "Template" → "${t['templateLabel']}"`);
                    } else if (text === 'Show print area' && t['showPrintAreaLabel']) {
                        element.textContent = t['showPrintAreaLabel'];
                        console.log(`SPECIFIC SELECTOR TRANSLATED: "Show print area" → "${t['showPrintAreaLabel']}"`);
                    } else if (text === 'File format' && t['fileFormatLabel']) {
                        element.textContent = t['fileFormatLabel'];
                        console.log(`SPECIFIC SELECTOR TRANSLATED: "File format" → "${t['fileFormatLabel']}"`);
                    } else if (text === 'Advanced options' && t['advancedOptionsLabel']) {
                        element.textContent = t['advancedOptionsLabel'];
                        console.log(`SPECIFIC SELECTOR TRANSLATED: "Advanced options" → "${t['advancedOptionsLabel']}"`);
                    }
                });
            } catch (e) {
                // Ignore invalid selectors
            }
        });
        
        // Strategy 2: Global text scanning with priority for these specific elements
        const allPrintElements = document.querySelectorAll('*');
        allPrintElements.forEach(element => {
            if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                const text = element.textContent.trim();
                
                                 // Priority mappings for the specific elements you mentioned
                 const priorityMappings = [
                     { english: 'Template', key: 'templateLabel' },
                     { english: 'Show print area', key: 'showPrintAreaLabel' },
                     { english: 'File format', key: 'fileFormatLabel' },
                     { english: 'Advanced options', key: 'advancedOptionsLabel' },
                     { english: 'File name', key: 'fileNameLabel' },
                     { english: 'Width', key: 'widthLabel' },
                     { english: 'Height', key: 'heightLabel' },
                     { english: 'Title', key: 'titleLabel' },
                     { english: 'Title of file', key: 'titleOfFilePlaceholder' },
                     { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                     { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                     { english: 'PDF', key: 'pdfFormat' },
                     { english: 'Set scale', key: 'setScaleLabel' },
                     { english: 'Author', key: 'authorLabel' },
                     { english: 'Copyright', key: 'copyrightLabel' },
                     { english: 'DPI', key: 'dpiLabel' },
                     { english: 'Include legend', key: 'includeLegendLabel' },
                     { english: 'Add bookmark', key: 'addBookmarkDialogTitle' },
                     { english: 'Title', key: 'bookmarkTitleInputLabel' },
                     { english: 'Enter a title', key: 'bookmarkTitleInputPlaceholder' }
                 ];
                
                priorityMappings.forEach(mapping => {
                    if (text === mapping.english && t[mapping.key]) {
                        element.textContent = t[mapping.key];
                        console.log(`PRIORITY PRINT TRANSLATED: "${mapping.english}" → "${t[mapping.key]}"`);
                    }
                });
            }
        });
        
        // Strategy 3: Force translation by finding elements containing these texts
        const forceSelectors = [
            'label', 'span', 'div', 'button', 'option'
        ];
        
        forceSelectors.forEach(tagName => {
            const elements = document.querySelectorAll(tagName);
            elements.forEach(element => {
                if (element.children.length === 0 && element.textContent) {
                    const text = element.textContent.trim();
                    
                                         if (text === 'Template' && t['templateLabel']) {
                         element.textContent = t['templateLabel'];
                         console.log(`FORCE TRANSLATED: "Template" → "${t['templateLabel']}"`);
                     } else if (text === 'Show print area' && t['showPrintAreaLabel']) {
                         element.textContent = t['showPrintAreaLabel'];
                         console.log(`FORCE TRANSLATED: "Show print area" → "${t['showPrintAreaLabel']}"`);
                     } else if (text === 'File format' && t['fileFormatLabel']) {
                         element.textContent = t['fileFormatLabel'];
                         console.log(`FORCE TRANSLATED: "File format" → "${t['fileFormatLabel']}"`);
                     } else if (text === 'Advanced options' && t['advancedOptionsLabel']) {
                         element.textContent = t['advancedOptionsLabel'];
                         console.log(`FORCE TRANSLATED: "Advanced options" → "${t['advancedOptionsLabel']}"`);
                     } else if (text === 'File name' && t['fileNameLabel']) {
                         element.textContent = t['fileNameLabel'];
                         console.log(`FORCE TRANSLATED: "File name" → "${t['fileNameLabel']}"`);
                     } else if (text === 'Width' && t['widthLabel']) {
                         element.textContent = t['widthLabel'];
                         console.log(`FORCE TRANSLATED: "Width" → "${t['widthLabel']}"`);
                     } else if (text === 'Height' && t['heightLabel']) {
                         element.textContent = t['heightLabel'];
                         console.log(`FORCE TRANSLATED: "Height" → "${t['heightLabel']}"`);
                     } else if (text === 'Set scale' && t['setScaleLabel']) {
                         element.textContent = t['setScaleLabel'];
                         console.log(`FORCE TRANSLATED: "Set scale" → "${t['setScaleLabel']}"`);
                     } else if (text === 'Author' && t['authorLabel']) {
                         element.textContent = t['authorLabel'];
                         console.log(`FORCE TRANSLATED: "Author" → "${t['authorLabel']}"`);
                     } else if (text === 'Copyright' && t['copyrightLabel']) {
                         element.textContent = t['copyrightLabel'];
                         console.log(`FORCE TRANSLATED: "Copyright" → "${t['copyrightLabel']}"`);
                     } else if (text === 'DPI' && t['dpiLabel']) {
                         element.textContent = t['dpiLabel'];
                         console.log(`FORCE TRANSLATED: "DPI" → "${t['dpiLabel']}"`);
                     } else if (text === 'Include legend' && t['includeLegendLabel']) {
                         element.textContent = t['includeLegendLabel'];
                         console.log(`FORCE TRANSLATED: "Include legend" → "${t['includeLegendLabel']}"`);
                     } else if (text === 'Add bookmark' && t['addBookmarkDialogTitle']) {
                         element.textContent = t['addBookmarkDialogTitle'];
                         console.log(`FORCE TRANSLATED: "Add bookmark" → "${t['addBookmarkDialogTitle']}"`);
                     } else if (text === 'Title' && t['bookmarkTitleInputLabel']) {
                         element.textContent = t['bookmarkTitleInputLabel'];
                         console.log(`FORCE TRANSLATED: "Title" → "${t['bookmarkTitleInputLabel']}"`);
                     }
                }
            });
                 });
         
         // Strategy 4: Translate placeholders specifically
         console.log("Translating placeholders...");
         const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
         inputElements.forEach(input => {
             const placeholder = input.getAttribute('placeholder');
             if (placeholder) {
                 if (placeholder === 'File name' && t['fileNamePlaceholder']) {
                     input.setAttribute('placeholder', t['fileNamePlaceholder']);
                     console.log(`PLACEHOLDER TRANSLATED: "File name" → "${t['fileNamePlaceholder']}"`);
                 } else if (placeholder === 'Title of file' && t['titleOfFilePlaceholder']) {
                     input.setAttribute('placeholder', t['titleOfFilePlaceholder']);
                     console.log(`PLACEHOLDER TRANSLATED: "Title of file" → "${t['titleOfFilePlaceholder']}"`);
                 } else if (placeholder === 'Enter a title' && t['titleOfFilePlaceholder']) {
                     input.setAttribute('placeholder', t['titleOfFilePlaceholder']);
                     console.log(`PLACEHOLDER TRANSLATED: "Enter a title" → "${t['titleOfFilePlaceholder']}"`);
                 } else if (placeholder === 'Enter a title' && t['bookmarkTitleInputPlaceholder']) {
                     input.setAttribute('placeholder', t['bookmarkTitleInputPlaceholder']);
                     console.log(`BOOKMARK PLACEHOLDER TRANSLATED: "Enter a title" → "${t['bookmarkTitleInputPlaceholder']}"`);
                 }
             }
         });
         
         // Strategy 5: Continuous monitoring for Print dialog elements
         let printTranslationInterval = setInterval(() => {
             console.log("Continuous Print dialog translation monitoring...");
             
             // Check if Print dialog is still open
             const printDialog = document.querySelector('.esri-print__dialog, .esri-print, [role="dialog"]');
             if (!printDialog) {
                 console.log("Print dialog closed, stopping monitoring");
                 clearInterval(printTranslationInterval);
                 return;
             }
             
             // Translate all elements in Print dialog
             const allElements = document.querySelectorAll('*');
             let translatedCount = 0;
             
             allElements.forEach(element => {
                 if (element.children.length === 0 && element.textContent && element.textContent.trim()) {
                     const text = element.textContent.trim();
                     
                                             const continuousMappings = [
                            { english: 'Template', key: 'templateLabel' },
                            { english: 'Show print area', key: 'showPrintAreaLabel' },
                            { english: 'File format', key: 'fileFormatLabel' },
                            { english: 'Advanced options', key: 'advancedOptionsLabel' },
                            { english: 'File name', key: 'fileNameLabel' },
                            { english: 'Width', key: 'widthLabel' },
                            { english: 'Height', key: 'heightLabel' },
                            { english: 'Title', key: 'titleLabel' },
                            { english: 'Title of file', key: 'titleOfFilePlaceholder' },
                            { english: 'Enter a title', key: 'titleOfFilePlaceholder' },
                            { english: 'Letter ANSI A landscape', key: 'letterAnsiALandscape' },
                            { english: 'PDF', key: 'pdfFormat' },
                            { english: 'Set scale', key: 'setScaleLabel' },
                            { english: 'Author', key: 'authorLabel' },
                            { english: 'Copyright', key: 'copyrightLabel' },
                            { english: 'DPI', key: 'dpiLabel' },
                            { english: 'Include legend', key: 'includeLegendLabel' },
                            { english: 'Add bookmark', key: 'addBookmarkDialogTitle' },
                            { english: 'Title', key: 'bookmarkTitleInputLabel' },
                            { english: 'Enter a title', key: 'bookmarkTitleInputPlaceholder' }
                        ];
                     
                     continuousMappings.forEach(mapping => {
                         if (text === mapping.english && t[mapping.key]) {
                             element.textContent = t[mapping.key];
                             translatedCount++;
                             console.log(`CONTINUOUS TRANSLATED: "${mapping.english}" → "${t[mapping.key]}"`);
                         }
                     });
                 }
             });
             
             // Also translate placeholders continuously
             const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
             inputElements.forEach(input => {
                 const placeholder = input.getAttribute('placeholder');
                 if (placeholder) {
                     if (placeholder === 'File name' && t['fileNamePlaceholder']) {
                         input.setAttribute('placeholder', t['fileNamePlaceholder']);
                         translatedCount++;
                         console.log(`CONTINUOUS PLACEHOLDER: "File name" → "${t['fileNamePlaceholder']}"`);
                     } else if (placeholder === 'Title of file' && t['titleOfFilePlaceholder']) {
                         input.setAttribute('placeholder', t['titleOfFilePlaceholder']);
                         translatedCount++;
                         console.log(`CONTINUOUS PLACEHOLDER: "Title of file" → "${t['titleOfFilePlaceholder']}"`);
                     } else if (placeholder === 'Enter a title' && t['titleOfFilePlaceholder']) {
                         input.setAttribute('placeholder', t['titleOfFilePlaceholder']);
                         translatedCount++;
                         console.log(`CONTINUOUS PLACEHOLDER: "Enter a title" → "${t['titleOfFilePlaceholder']}"`);
                     }
                 }
             });
             
             if (translatedCount > 0) {
                 console.log(`Continuous translation: ${translatedCount} elements translated`);
             }
             
         }, 200); // Check every 200ms
         
         // Stop monitoring after 10 seconds
         setTimeout(() => {
             if (printTranslationInterval) {
                 clearInterval(printTranslationInterval);
                 console.log("Print dialog translation monitoring stopped after 10 seconds");
             }
         }, 10000);
         
     }, 500);
}