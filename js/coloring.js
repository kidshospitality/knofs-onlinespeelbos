// Kleurboek-specifieke functies
document.addEventListener('DOMContentLoaded', function() {
  // Canvas tekening initialiseren als we op de kleurboek pagina zijn
  if (window.location.pathname.includes('coloring.html')) {
    initColoringCanvas();
    
    // Welkomstbericht voor kleurboek
    setTimeout(() => {
      typeSpeechMessage("Welkom in mijn kleurboek! Kies een kleur en begin met tekenen. Wat ga je maken?");
    }, 500);
  }
});

// Kleurboek canvas initialiseren
function initColoringCanvas() {
  const canvas = document.getElementById('coloring-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('color-picker');
  const brushSize = document.getElementById('brush-size');
  const clearButton = document.getElementById('clear-canvas');
  
  // Canvas grootte instellen
  function resizeCanvas() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;
    
    const width = canvasContainer.offsetWidth;
    const height = Math.min(500, window.innerHeight - 300);
    
    canvas.width = width;
    canvas.height = height;
    
    // Witte achtergrond
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Canvas grootte aanpassen bij laden en resizen
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Variabelen voor tekenen
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Teken functies
  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(canvas, e);
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = colorPicker.value;
    
    const [x, y] = getMousePos(canvas, e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    [lastX, lastY] = [x, y];
  }
  
  function stopDrawing() {
    isDrawing = false;
  }
  
  // Helper functie voor muis/touch positie
  function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.type.includes('touch')) {
      return [
        (e.touches[0].clientX - rect.left) * scaleX,
        (e.touches[0].clientY - rect.top) * scaleY
      ];
    } else {
      return [
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY
      ];
    }
  }
  
  // Event listeners voor muis en touch
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  canvas.addEventListener('touchstart', startDrawing);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDrawing);
  
  // Clear button
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      typeSpeechMessage("Je hebt een schoon canvas! Wat ga je nu tekenen?");
    });
  }
  
  // Kleurenknoppen
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      colorPicker.value = this.dataset.color;
      typeSpeechMessage(`Je hebt ${this.dataset.name} gekozen! Een mooie kleur!`);
    });
  });
}
