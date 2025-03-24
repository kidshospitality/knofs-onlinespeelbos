// Functie om gedeelde componenten in te voegen
document.addEventListener('DOMContentLoaded', function() {
  // Laad de Top Navigation Bar
  fetch('/components/top-nav.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('top-nav-container').innerHTML = data;
      initTopNav();
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
      } else {
        // Als er geen container is, voeg de modal toe aan het einde van de body
        const div = document.createElement('div');
        div.id = 'settings-modal-container';
        div.innerHTML = data;
        document.body.appendChild(div);
      }
    })
    .catch(error => {
      console.error('Error loading settings modal:', error);
    });
});

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
    slow: 70,
    medium: 50,
    fast: 30
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
      typeSpeechMessage("Hoi! Ik ben Knof. Hoe voel je je vandaag?");
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
  
  // Sluit-knop in modal
  setTimeout(() => {
    const closeBtn = document.getElementById('close-settings');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const modal = document.getElementById('settings-modal');
        if (modal) modal.style.display = 'none';
      });
    }
    
    // Event listeners voor instellingen
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      // Initialiseer met opgeslagen waarde (indien beschikbaar)
      const savedVolume = localStorage.getItem('volume');
      if (savedVolume) volumeSlider.value = savedVolume;
      
      volumeSlider.addEventListener('change', () => {
        localStorage.setItem('volume', volumeSlider.value);
      });
    }
    
    const textSpeed = document.getElementById('text-speed');
    if (textSpeed) {
      // Initialiseer met opgeslagen waarde (indien beschikbaar)
      const savedSpeed = localStorage.getItem('textSpeed');
      if (savedSpeed) textSpeed.value = savedSpeed;
      
      textSpeed.addEventListener('change', () => {
        localStorage.setItem('textSpeed', textSpeed.value);
      });
    }
  }, 100);
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
        typeSpeechMessage("Oeps! De placemat-functie ligt nog in de oven!");
      } else {
        // Fallback in geval de popup niet bestaat op deze pagina
        alert("Deze functie wordt nog gebakken, kom snel terug! 🧁");
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
