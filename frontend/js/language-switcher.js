/**
 * Language Switcher Component for ReSellPro
 * This component adds a language selector to the navigation bar
 * and handles language switching functionality
 */
class LanguageSwitcher {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = Object.assign({
            position: 'right',
            displayNames: true,
            flagIcons: true,
            dropdownStyle: true,
            availableLanguages: ['en', 'hi', 'gu'],
            onChange: null
        }, options);
        
        this.i18n = window.i18n;
        this.currentLanguage = this.i18n.getCurrentLanguage();
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('Language switcher container not found');
            return;
        }
        
        // Create elements based on options
        if (this.options.dropdownStyle) {
            this.createDropdownSwitcher();
        } else {
            this.createButtonsSwitcher();
        }
        
        // Set initial active state
        this.updateActiveState();
        
        // Listen for language change events
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateActiveState();
        });
    }
    
    createDropdownSwitcher() {
        // Create dropdown container
        const dropdownContainer = document.createElement('li');
        dropdownContainer.className = 'nav-item dropdown';
        
        // Create dropdown toggle button
        const dropdownToggle = document.createElement('a');
        dropdownToggle.className = 'nav-link dropdown-toggle';
        dropdownToggle.href = '#';
        dropdownToggle.setAttribute('role', 'button');
        dropdownToggle.setAttribute('data-bs-toggle', 'dropdown');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        
        // Add language icon or name to toggle
        const languageIcon = document.createElement('i');
        languageIcon.className = 'bi bi-globe me-1';
        dropdownToggle.appendChild(languageIcon);
        
        // Add current language name
        const languageName = document.createElement('span');
        languageName.setAttribute('data-i18n', 'language');
        languageName.textContent = this.i18n.getTranslation('language');
        dropdownToggle.appendChild(languageName);
        
        // Create dropdown menu
        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
        
        // Add language options
        this.options.availableLanguages.forEach(lang => {
            const languageOption = document.createElement('li');
            const languageLink = document.createElement('a');
            languageLink.className = 'dropdown-item language-option';
            languageLink.href = '#';
            languageLink.setAttribute('data-lang', lang);
            
            // Add flag icon if enabled
            if (this.options.flagIcons) {
                const flagSpan = document.createElement('span');
                flagSpan.className = `flag-icon flag-icon-${this.getFlagCode(lang)} me-2`;
                languageLink.appendChild(flagSpan);
            }
            
            // Add language name
            const nameSpan = document.createElement('span');
            nameSpan.textContent = this.getLanguageName(lang);
            languageLink.appendChild(nameSpan);
            
            // Add language option to dropdown
            languageOption.appendChild(languageLink);
            dropdownMenu.appendChild(languageOption);
            
            // Add click handler for language selection
            languageLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchLanguage(lang);
            });
        });
        
        // Assemble the dropdown
        dropdownContainer.appendChild(dropdownToggle);
        dropdownContainer.appendChild(dropdownMenu);
        
        // Add to container
        this.container.appendChild(dropdownContainer);
    }
    
    createButtonsSwitcher() {
        const languagesContainer = document.createElement('div');
        languagesContainer.className = 'd-flex align-items-center language-buttons';
        
        if (this.options.displayNames) {
            const languageLabel = document.createElement('span');
            languageLabel.className = 'me-2';
            languageLabel.setAttribute('data-i18n', 'language');
            languageLabel.textContent = this.i18n.getTranslation('language');
            languagesContainer.appendChild(languageLabel);
        }
        
        // Create button for each language
        this.options.availableLanguages.forEach(lang => {
            const langButton = document.createElement('button');
            langButton.className = 'btn btn-sm language-btn me-1';
            langButton.setAttribute('data-lang', lang);
            
            if (this.options.flagIcons) {
                const flagSpan = document.createElement('span');
                flagSpan.className = `flag-icon flag-icon-${this.getFlagCode(lang)} me-1`;
                langButton.appendChild(flagSpan);
            }
            
            if (this.options.displayNames) {
                const nameSpan = document.createElement('span');
                nameSpan.textContent = this.getLanguageName(lang);
                langButton.appendChild(nameSpan);
            }
            
            // Add click handler
            langButton.addEventListener('click', () => {
                this.switchLanguage(lang);
            });
            
            languagesContainer.appendChild(langButton);
        });
        
        // Add to container
        this.container.appendChild(languagesContainer);
    }
    
    switchLanguage(language) {
        if (language === this.currentLanguage) return;
        
        this.i18n.changeLanguage(language);
        this.currentLanguage = language;
        
        // Call onChange callback if provided
        if (typeof this.options.onChange === 'function') {
            this.options.onChange(language);
        }
        
        this.updateActiveState();
    }
    
    updateActiveState() {
        // Update dropdown display
        if (this.options.dropdownStyle) {
            const options = this.container.querySelectorAll('.language-option');
            options.forEach(option => {
                const lang = option.getAttribute('data-lang');
                if (lang === this.currentLanguage) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        } else {
            // Update buttons display
            const buttons = this.container.querySelectorAll('.language-btn');
            buttons.forEach(button => {
                const lang = button.getAttribute('data-lang');
                if (lang === this.currentLanguage) {
                    button.classList.add('btn-primary');
                    button.classList.remove('btn-outline-secondary');
                } else {
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-outline-secondary');
                }
            });
        }
    }
    
    getLanguageName(code) {
        const names = {
            'en': 'English',
            'hi': 'हिंदी',
            'gu': 'ગુજરાતી'
        };
        return names[code] || code.toUpperCase();
    }
    
    getFlagCode(languageCode) {
        // Map language codes to country flag codes
        const flagMap = {
            'en': 'us', // English -> USA flag
            'hi': 'in', // Hindi -> India flag
            'gu': 'in'  // Gujarati -> India flag (could be represented by India too)
        };
        return flagMap[languageCode] || languageCode;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if the language switcher container exists
    const switcherContainer = document.getElementById('languageSwitcherContainer');
    if (switcherContainer) {
        // Create language switcher
        window.languageSwitcher = new LanguageSwitcher('#languageSwitcherContainer', {
            dropdownStyle: true,
            flagIcons: false,
            onChange: function(language) {
                console.log('Language changed to:', language);
            }
        });
    }
});