// Globale variabele voor vertaalgegevens
let translations = {};

// Laad vertalingen bij het opstarten
function loadTranslations() {
  const lang = localStorage.getItem('language') || 'nl';
  return fetch(`/languages/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      translations = data;
      applyTranslations();
      return data;
    })
    .catch(error => {
      console.error('Error loading translations:', error);
      // Fallback naar Nederlands bij een fout
      if (lang !== 'nl') {
        localStorage.setItem('language', 'nl');
        return loadTranslations();
      }
    });
}

// Vertaal een string op basis van de sleutel
function __(key, defaultText = '') {
  return translations[key] || defaultText || key;
}

// Pas vertalingen toe op alle elementen met data-i18n attribuut
function applyTranslations() {
  // Titel van de pagina
  document.title = __('app_title', "Knof's Online Speelbos");
  
  // Elementen met data-i18n attribuut
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = __(key);
    }
  });
  
  // Elementen met data-i18n-placeholder attribuut (voor input placeholders)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key) {
      element.placeholder = __(key);
    }
  });
  
  // Vertaal HTML5 elementen met data-i18n-html (voor elementen die HTML mogen bevatten)
  document.querySelectorAll('[data-i18n-html]').forEach(element => {
    const key = element.getAttribute('data-i18n-html');
    if (key) {
      element.innerHTML = __(key);
    }
  });
  
  // Vertaal dropdown opties
  translateDropdowns();
}

// Vertaal dropdown selecties
function translateDropdowns() {
  const textSpeed = document.getElementById('text-speed');
  if (textSpeed) {
    Array.from(textSpeed.options).forEach(option => {
      option.text = __(`${option.value}`, option.text);
    });
  }
}

// Functie om de gekozen taal toe te passen
function applyLanguage(lang) {
  localStorage.setItem('language', lang);
  loadTranslations().then(() => {
    console.log(`Taal gewijzigd naar: ${lang}`);
    // Dynamic translation happens without page reload
  });
}

// Functie om gedeelde componenten in te voegen
document.addEventListener('DOMContentLoaded', function() {
  // Laad eerst vertalingen
  loadTranslations().then(() => {
    // Voeg de popup toe aan elke pagina als deze nog niet bestaat
    if (!document.getElementById('popup-message')) {
      const popupDiv = document.createElement('div');
      popupDiv.id = 'popup-message';
      popupDiv.className = 'popup';
      popupDiv.innerHTML = `
        <div class="popup-content">
          <span class="close-popup">&times;</span>
          <p data-i18n="popup_message">Deze functie wordt nog gebakken, kom snel terug! 🧁</p>
        </div>
      `;
      document.body.appendChild(popupDiv);
      
      // Pas vertalingen toe op de nieuwe popup
      applyTranslations();
      
      // Popup sluiten wanneer op het X icoontje wordt geklikt
      popupDiv.querySelector('.close-popup').addEventListener('click', function() {
        document.getElementById('popup-message').style.display = 'none';
      });
      
      // Popup sluiten wanneer ergens anders wordt geklikt
      window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('popup-message')) {
          document.getElementById('popup-message').style.display = 'none';
        }
      });
    }

    // Laad de Top Navigation Bar
    fetch('/components/top-nav.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('top-nav-container').innerHTML = data;
        initTopNav();
        applyTranslations(); // Vertaal na het laden
      })
      .catch(error => {
        console.error('Error loading top nav:', error);
        // Fallback voor offline gebruik
        document.getElementById('top-nav-container').innerHTML = 
          '<div class="top-nav-bar"><div class="top-nav-bar-bg"></div><div class="top-nav-inner"><div class="top-nav-knof" id="top-nav-knof"><img src="/images/knof.png" alt="Knof"></div></div></div>';
      });
    
    // Laad de Bottom Navigation Bar
    fetch('/components/bottom-nav.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('bottom-nav-container').innerHTML = data;
        initBottomNav();
        applyTranslations(); // Vertaal na het laden
      })
      .catch(error => {
        console.error('Error loading bottom nav:', error);
        // Fallback voor offline gebruik
        document.getElementById('bottom-nav-container').innerHTML = 
          '<div class="nav-bar"><div class="nav-bar-bg"></div></div>';
      });
      
    // Laad de Settings Modal
    fetch('/components/settings-modal.html')
      .then(response => response.text())
      .then(data => {
        // Voeg de modal toe als het container element bestaat
        const settingsContainer = document.getElementById('settings-modal-container');
        if (settingsContainer) {
          settingsContainer.innerHTML = data;
          
          // Initialiseer taal-selectie en tekstsnelheid na het laden
          setTimeout(() => {
            initSettingsModal();
            applyTranslations(); // Vertaal na het laden
          }, 100);
        } else {
          // Als er geen container is, voeg de modal toe aan het einde van de body
          const div = document.createElement('div');
          div.id = 'settings-modal-container';
          div.innerHTML = data;
          document.body.appendChild(div);
          
          setTimeout(() => {
            initSettingsModal();
            applyTranslations(); // Vertaal na het laden
          }, 100);
        }
      })
      .catch(error => {
        console.error('Error loading settings modal:', error);
      });
  });
});

// Initialiseer de settings modal (taal en tekstsnelheid)
function initSettingsModal() {
  const closeBtn = document.getElementById('close-settings');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const modal = document.getElementById('settings-modal');
      if (modal) modal.style.display = 'none';
    });
  }
  
  // Event listener voor tekstsnelheid instelling
  const textSpeed = document.getElementById('text-speed');
  if (textSpeed) {
    // Initialiseer met opgeslagen waarde (indien beschikbaar)
    const savedSpeed = localStorage.getItem('textSpeed') || 'medium';
    textSpeed.value = savedSpeed;
    
    textSpeed.addEventListener('change', () => {
      localStorage.setItem('textSpeed', textSpeed.value);
    });
  }
  
  // Event listeners voor taalinstellingen
  const languageOptions = document.querySelectorAll('.language-option');
  if (languageOptions.length > 0) {
    // Initialiseer met opgeslagen taal (indien beschikbaar)
    const savedLanguage = localStorage.getItem('language') || 'nl';
    
    // Markeer de juiste taal als geselecteerd
    languageOptions.forEach(option => {
      if (option.getAttribute('data-lang') === savedLanguage) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
      
      // Voeg click event toe
      option.addEventListener('click', function() {
        // Verwijder selected class van alle opties
        languageOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Voeg selected class toe aan de aangeklikte optie
        this.classList.add('selected');
        
        // Pas de taal toe
        const lang = this.getAttribute('data-lang');
        applyLanguage(lang);
      });
    });
  }
}

// Variabele voor type-timer
let typeTextTimer = null;

// Functie om lopende typende tekst te stoppen
function clearTypingSpeech() {
  if (typeTextTimer) {
    clearTimeout(typeTextTimer);
    typeTextTimer = null;
  }
}

// Functie om tekst letter voor letter te typen
function typeText(element, text, speed = 50) {
  // Eerst eventuele lopende tekst stoppen
  clearTypingSpeech();
  
  let index = 0;
  element.textContent = '';
  
  // Bepaal de snelheid op basis van instellingen (indien beschikbaar)
  const textSpeedSetting = localStorage.getItem('textSpeed') || 'medium';
  const speedMap = {
    slow: 175,    // Langzamer (2x zo langzaam als normaal)
    medium: 75,   // Normaal
    fast: 40      // Snel
  };
  speed = speedMap[textSpeedSetting] || speed;
  
  // Cursor tonen
  const cursor = element.parentNode.querySelector('.typing-cursor');
  if (cursor) cursor.style.display = 'inline-block';
  
  function addNextCharacter() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      
      // Controleer of de tekst buiten de container komt
      const container = element.parentNode;
      if (element.offsetWidth > container.offsetWidth) {
        const overshoot = element.offsetWidth - container.offsetWidth + 20;
        element.style.marginLeft = `-${overshoot}px`;
      }
      
      typeTextTimer = setTimeout(addNextCharacter, speed);
    }
  }
  
  addNextCharacter();
}

// Functie voor Knof's typende tekstberichten
function typeSpeechMessage(message) {
  const typwriterText = document.getElementById('typwriter-text');
  if (!typwriterText) return;
  
  typwriterText.style.marginLeft = '0';
  typeText(typwriterText, message);
}

// Initialiseer de top nav
function initTopNav() {
  // Knof-knop activeert spraak
  const knofBtn = document.getElementById('top-nav-knof');
  if (knofBtn) {
    knofBtn.addEventListener('click', () => {
      typeSpeechMessage(__("greeting", "Hoi! Ik ben Knof. Hoe voel je je vandaag?"));
    });
  }
  
  // Settings-knop opent modal
  const settingsBtn = document.getElementById('top-nav-settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      const modal = document.getElementById('settings-modal');
      if (modal) modal.style.display = 'flex';
    });
  }
}

// Initialiseer de bottom nav
function initBottomNav() {
  // Navigatie-knoppen
  const homeIcon = document.getElementById('home-icon');
  if (homeIcon) {
    homeIcon.addEventListener('click', () => {
      window.location.href = '/index.html';
    });
  }
  
  const gamesIcon = document.getElementById('games-icon');
  if (gamesIcon) {
    gamesIcon.addEventListener('click', () => {
      window.location.href = '/games.html';
    });
  }
  
  const coloringIcon = document.getElementById('coloring-icon');
  if (coloringIcon) {
    coloringIcon.addEventListener('click', () => {
      window.location.href = '/coloring.html';
    });
  }
  
  const placematIcon = document.getElementById('placemat-icon');
  if (placematIcon) {
    placematIcon.addEventListener('click', (e) => {
      e.preventDefault(); // Voorkom de standaard navigatie
      
      // Toon de popup in plaats van naar een andere pagina te navigeren
      const popup = document.getElementById('popup-message');
      if (popup) {
        popup.style.display = 'flex';
        
        // Toon ook een leuk bericht van Knof
        typeSpeechMessage(__("placemat_popup", "Oeps! De placemat-functie ligt nog in de oven!"));
      } else {
        // Fallback in geval de popup niet bestaat op deze pagina
        alert(__("popup_message", "Deze functie wordt nog gebakken, kom snel terug! 🧁"));
      }
    });
  }
  
  const chatIcon = document.getElementById('chat-icon');
  if (chatIcon) {
    chatIcon.addEventListener('click', () => {
      window.location.href = '/chat.html';
    });
  }
}

// PWA service worker registratie
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('ServiceWorker geregistreerd'))
      .catch(error => console.log('ServiceWorker registratie mislukt:', error));
  });
}

// Helper functie om huidige pagina in navigatie te markeren
function highlightCurrentPage() {
  const currentPath = window.location.pathname;
  
  // Verwijder alle active classes
  document.querySelectorAll('.nav-icon').forEach(icon => {
    icon.classList.remove('active');
  });
  
  // Voeg active class toe aan juiste icoon
  if (currentPath.includes('index.html') || currentPath === '/') {
    const homeIcon = document.getElementById('home-icon');
    if (homeIcon) homeIcon.classList.add('active');
  } else if (currentPath.includes('games.html') || currentPath.includes('/games/')) {
    const gamesIcon = document.getElementById('games-icon');
    if (gamesIcon) gamesIcon.classList.add('active');
  } else if (currentPath.includes('coloring.html')) {
    const coloringIcon = document.getElementById('coloring-icon');
    if (coloringIcon) coloringIcon.classList.add('active');
  } else if (currentPath.includes('placemat.html')) {
    const placematIcon = document.getElementById('placemat-icon');
    if (placematIcon) placematIcon.classList.add('active');
  } else if (currentPath.includes('chat.html')) {
    const chatIcon = document.getElementById('chat-icon');
    if (chatIcon) chatIcon.classList.add('active');
  }
}

// Voer uit na het laden van de componenten
setTimeout(highlightCurrentPage, 500);
