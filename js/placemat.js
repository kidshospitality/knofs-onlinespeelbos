// Placemat-specifieke functies
document.addEventListener('DOMContentLoaded', function() {
  // Controleer of we op de placemat pagina zijn
  if (window.location.pathname.includes('placemat.html')) {
    initPlacemat();
    
    // Welkomstbericht voor placemat
    setTimeout(() => {
      typeSpeechMessage("Welkom bij de interactieve placemat! Scan de QR-code met je telefoon en er gebeurt iets magisch!");
    }, 500);
  }
});

// Placemat initialiseren
function initPlacemat() {
  console.log('Placemat initialized');
  
  // QR code element opvragen
  const qrCode = document.getElementById('qr-code');
  if (!qrCode) return;
  
  // QR code tonen
  qrCode.style.display = 'block';
  
  // Instructies tonen en verbergen
  const showInstructions = document.getElementById('show-instructions');
  const instructions = document.getElementById('placemat-instructions');
  
  if (showInstructions && instructions) {
    showInstructions.addEventListener('click', () => {
      if (instructions.style.display === 'none' || !instructions.style.display) {
        instructions.style.display = 'block';
        showInstructions.textContent = 'Verberg instructies';
        typeSpeechMessage("Dit zijn de instructies! Volg ze goed op voor een magische ervaring!");
      } else {
        instructions.style.display = 'none';
        showInstructions.textContent = 'Toon instructies';
      }
    });
  }
  
  // Download knop
  const downloadBtn = document.getElementById('download-placemat');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // Hier zou je normaal een download actie hebben
      alert('De placemat wordt gedownload. Print hem uit voor de volledige ervaring!');
      typeSpeechMessage("Super! Print de placemat uit en leg hem op tafel. Scan dan de QR-code met je telefoon!");
    });
  }
}
