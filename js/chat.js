// Chat-specifieke functies
document.addEventListener('DOMContentLoaded', function() {
  // Controleer of we op de chat pagina zijn
  if (window.location.pathname.includes('chat.html')) {
    initChat();
    
    // Welkomstbericht voor chat
    setTimeout(() => {
      typeSpeechMessage("Hoi! Ik ben Knof. Wat wil je weten? Ik weet veel over natuur en dieren!");
      addMessage("Hoi! Ik ben Knof. Wat wil je weten? Ik weet veel over natuur en dieren!", 'knof');
    }, 500);
  }
});

// Chat initialiseren
function initChat() {
  console.log('Chat initialized');
  
  // Chat form element opvragen
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  
  if (!chatForm || !chatInput || !chatMessages) return;
  
  // Verzenden van berichten
  chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Gebruikersbericht toevoegen
    addMessage(message, 'user');
    
    // Chatinput leegmaken
    chatInput.value = '';
    
    // Simuleer een antwoord van Knof
    setTimeout(() => {
      const response = getKnofResponse(message);
      addMessage(response, 'knof');
      
      // Laat Knof het antwoord typen in de bovenbalk
      typeSpeechMessage(response);
    }, 1000);
  });
  
  // Functie om bericht toe te voegen aan chat
  window.addMessage = function(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    if (sender === 'knof') {
      // Knof avatar toevoegen bij Knof berichten
      const avatar = document.createElement('div');
      avatar.className = 'chat-avatar';
      avatar.innerHTML = '<img src="/images/knof.png" alt="Knof">';
      messageDiv.appendChild(avatar);
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = text;
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll naar beneden
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };
  
  // Eenvoudige antwoorden van Knof
  function getKnofResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('hallo') || lowerMsg.includes('hoi') || lowerMsg.includes('hey')) {
      return "Hoi! Leuk dat je met me wilt praten! Hoe gaat het met jou?";
    } else if (lowerMsg.includes('hoe gaat het') || lowerMsg.includes('hoe is het')) {
      return "Met mij gaat het super! Ik ben blij dat ik met jou kan kletsen. Wat wil je doen vandaag?";
    } else if (lowerMsg.includes('dier')) {
      return "Ik hou van dieren! Mijn favoriete dieren zijn konijnen, eekhoorns en vossen. Welk dier vind jij het leukst?";
    } else if (lowerMsg.includes('spel') || lowerMsg.includes('spelletje')) {
      return "Spelletjes zijn zo leuk! Ga naar de spelletjespagina om memory, puzzels en andere leuke dingen te spelen!";
    } else if (lowerMsg.includes('kleur') || lowerMsg.includes('tekenen')) {
      return "Tekenen en kleuren is zo leuk! Ga naar het kleurboek om je eigen kunstwerk te maken!";
    } else if (lowerMsg.includes('wat kan je') || lowerMsg.includes('wat kun je')) {
      return "Ik kan met je praten, spelletjes met je spelen, je helpen met tekenen, en nog veel meer! Wat wil je doen?";
    } else if (lowerMsg.includes('bedankt') || lowerMsg.includes('dankjewel')) {
      return "Graag gedaan! Ik vind het fijn om je te helpen!";
    } else if (lowerMsg.includes('leeftijd') || lowerMsg.includes('hoe oud')) {
      return "Ik ben nog heel jong, maar ik leer elke dag nieuwe dingen!";
    } else {
      // Willekeurige algemene antwoorden
      const responses = [
        "Dat is een goede vraag! Wat denk je er zelf van?",
        "Hmm, daar moet ik even over nadenken!",
        "Wat leuk dat je dat vraagt! Wil je daar meer over weten?",
        "Vertel me meer! Ik vind het interessant wat je zegt.",
        "Ik ben benieuwd waarom je dat vraagt!",
        "Weet je wat ook leuk is? De spelletjes in mijn speelbos proberen!"
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
}
