// Spellen-specifieke functies
document.addEventListener('DOMContentLoaded', function() {
  // Hier komen algemene functies voor alle spellen
  console.log('Games script loaded');
  
  // Functie om een spel te starten
  window.startGame = function(gameType) {
    console.log(`Starting game: ${gameType}`);
    // Implementatie afhankelijk van gameType
    
    // Knof's bericht bij spel starten
    switch(gameType) {
      case 'memory':
        typeSpeechMessage("Memory is een spel waarbij je moet onthouden waar de plaatjes zijn. Klik op twee kaartjes om te zien of ze hetzelfde zijn!");
        break;
      case 'puzzle':
        typeSpeechMessage("In dit puzzelspel moet je de stukjes op de juiste plek leggen. Sleep de stukjes naar de juiste plaats!");
        break;
      case 'drawing':
        typeSpeechMessage("Ik ga iets tekenen en jij moet raden wat het is! Ben je er klaar voor?");
        break;
      default:
        typeSpeechMessage("Laten we spelen! Kies een spelletje dat je leuk vindt.");
    }
  };
});

// Initialisatie voor memory spel
function initMemoryGame() {
  // Kaarten aanmaken, shufflen, etc.
  console.log('Memory game initialized');
  
  // Voorbeeld: kaarten aanmaken
  const memoryContainer = document.getElementById('memory-container');
  if (!memoryContainer) return;
  
  // Aantal paren kaarten
  const numPairs = 6;
  // Array met emoji's voor op de kaarten
  const emojis = ['🐶', '🐱', '🐭', '🐰', '🐻', '🐼', '🦊', '🦁', '🐯', '🐨', '🐸', '🐵'];
  
  // Selecteer random emoji's voor dit spel
  const gameEmojis = [];
  for (let i = 0; i < numPairs; i++) {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    gameEmojis.push(emojis[randomIndex]);
    // Verwijder de gebruikte emoji uit de array
    emojis.splice(randomIndex, 1);
  }
  
  // Dubbele array maken voor paren
  const cardEmojis = [...gameEmojis, ...gameEmojis];
  
  // Shuffle de kaarten
  const shuffledEmojis = cardEmojis.sort(() => Math.random() - 0.5);
  
  // Maak de kaarten aan
  shuffledEmojis.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.cardvalue = emoji;
    card.dataset.index = index;
    
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.innerHTML = '❓';
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    cardBack.innerHTML = emoji;
    
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    
    card.addEventListener('click', flipCard);
    memoryContainer.appendChild(card);
  });
}

// Bij het openen van een specifiek spel
if (window.location.pathname.includes('/games/memory.html')) {
  window.addEventListener('load', function() {
    initMemoryGame();
  });
}
