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
  const saveButton = document.getElementById('save-drawing');
  const loadTemplateButton = document.getElementById('load-template');
  
  // Voeg een template canvas toe voor kleurplaten
  const canvasContainer = document.getElementById('canvas-container');
  const templateCanvas = document.createElement('canvas');
  templateCanvas.id = 'template-canvas';
  templateCanvas.style.position = 'absolute';
  templateCanvas.style.top = '0';
  templateCanvas.style.left = '0';
  templateCanvas.style.pointerEvents = 'none';
  canvasContainer.appendChild(templateCanvas);
  const templateCtx = templateCanvas.getContext('2d');
  
  // Pad geschiedenis voor ongedaan maken
  let paths = [];
  let currentPath = null;
  let drawHistory = [];
  let currentHistoryIndex = -1;
  
  // Canvas grootte instellen
  function resizeCanvas() {
    if (!canvasContainer) return;
    
    const width = canvasContainer.offsetWidth;
    const height = Math.min(500, window.innerHeight - 300);
    
    canvas.width = width;
    canvas.height = height;
    templateCanvas.width = width;
    templateCanvas.height = height;
    
    // Witte achtergrond
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Herteken alle paden
    redrawCanvas();
  }
  
  // Canvas grootte aanpassen bij laden en resizen
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Variabelen voor tekenen
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Variabele voor huidige template
  let currentTemplate = null;
  
  // Teken functies
  function startDrawing(e) {
    isDrawing = true;
    const [x, y] = getMousePos(canvas, e);
    lastX = x;
    lastY = y;
    
    // Start een nieuw pad
    currentPath = { 
      color: colorPicker.value, 
      size: brushSize.value, 
      points: [{x: lastX, y: lastY}] 
    };
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    const [x, y] = getMousePos(canvas, e);
    
    // Voeg punt toe aan het huidige pad
    if (currentPath) {
      currentPath.points.push({x, y});
    }
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize.value;
    ctx.strokeStyle = colorPicker.value;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    // Creëer een vloeiende lijn met een kwadratische curve
    const controlX = (lastX + x) / 2;
    const controlY = (lastY + y) / 2;
    ctx.quadraticCurveTo(controlX, controlY, x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
  }
  
  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    // Voeg pad toe aan geschiedenis als er punten zijn
    if (currentPath && currentPath.points.length > 0) {
      paths.push(currentPath);
      
      // Update tekening geschiedenis
      drawHistory = drawHistory.slice(0, currentHistoryIndex + 1);
      drawHistory.push([...paths]);
      currentHistoryIndex = drawHistory.length - 1;
    }
    
    currentPath = null;
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
  
  // Functie om alles opnieuw te tekenen
  function redrawCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Teken alle paden
    drawPaths();
    
    // Teken template indien aanwezig
    drawTemplate();
  }
  
  // Functie om alle paden te tekenen
  function drawPaths() {
    const currentPaths = currentHistoryIndex >= 0 ? drawHistory[currentHistoryIndex] : [];
    
    currentPaths.forEach(path => {
      ctx.beginPath();
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = path.color;
      
      path.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else if (index === 1) {
          ctx.lineTo(point.x, point.y);
        } else {
          const prevPoint = path.points[index - 1];
          const controlX = (prevPoint.x + point.x) / 2;
          const controlY = (prevPoint.y + point.y) / 2;
          ctx.quadraticCurveTo(controlX, controlY, point.x, point.y);
        }
      });
      
      ctx.stroke();
    });
  }
  
  // Functie om template te tekenen
  function drawTemplate() {
    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    
    if (currentTemplate) {
      const img = new Image();
      img.onload = () => {
        templateCtx.drawImage(img, 0, 0, templateCanvas.width, templateCanvas.height);
      };
      img.src = currentTemplate;
    }
  }
  
  // Ongedaan maken functie
  function undo() {
    if (currentHistoryIndex > 0) {
      currentHistoryIndex--;
      paths = [...drawHistory[currentHistoryIndex]];
      redrawCanvas();
    } else if (currentHistoryIndex === 0) {
      currentHistoryIndex = -1;
      paths = [];
      redrawCanvas();
    }
  }
  
  // Functie om tekening op te slaan
  function saveDrawing() {
    // Creëer een tijdelijke canvas om tekening en template te combineren
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Teken de tekening
    tempCtx.drawImage(canvas, 0, 0);
    
    // Teken de template
    tempCtx.drawImage(templateCanvas, 0, 0);
    
    // Creëer download link
    const link = document.createElement('a');
    link.download = 'mijn_kleurplaat.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }
  
  // Functie om bevestiging voor wissen te vragen
  function confirmClear() {
    if (confirm('Weet je zeker dat je de tekening wilt wissen?')) {
      clearCanvas();
      typeSpeechMessage("Je hebt een schoon canvas! Wat ga je nu tekenen?");
    }
  }
  
  // Functie om canvas te wissen
  function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    paths = [];
    drawHistory = [];
    currentHistoryIndex = -1;
    currentTemplate = null;
    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
  }
  
  // Functie om template te laden
  function loadTemplate() {
    // Maak een lijst van beschikbare templates
    const templates = [
      { name: "Leeg vel", url: null },
      { name: "Knof", url: "images/kleurplaten/kleurplaat-knof1.png" },
      { name: "Kok", url: "images/kleurplaten/kleurplaat-kok1.png" }
    ];
    
    // Toon een simpele keuze dialoog
    let choice = "Kies een kleurplaat:\n";
    templates.forEach((template, index) => {
      choice += `${index}. ${template.name}\n`;
    });
    
    const selection = prompt(choice, "0");
    if (selection !== null && selection !== "") {
      const index = parseInt(selection);
      if (!isNaN(index) && index >= 0 && index < templates.length) {
        currentTemplate = templates[index].url;
        clearCanvas();
        drawTemplate();
        typeSpeechMessage(`Je hebt ${templates[index].name} gekozen! Begin maar met kleuren!`);
      }
    }
  }
  
  // Maak een "undo" knop
  const undoButton = document.createElement('button');
  undoButton.id = 'undo-button';
  undoButton.textContent = '↩️ Ongedaan maken';
  undoButton.className = 'coloring-button';
  document.querySelector('.drawing-tools').appendChild(undoButton);
  
  // Event listeners voor tekenen
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  canvas.addEventListener('touchstart', startDrawing);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDrawing);
  
  // Event listeners voor knoppen
  if (clearButton) {
    clearButton.addEventListener('click', confirmClear);
  }
  
  if (undoButton) {
    undoButton.addEventListener('click', undo);
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', saveDrawing);
  }
  
  if (loadTemplateButton) {
    loadTemplateButton.addEventListener('click', loadTemplate);
  }
  
  // Kleurenknoppen
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      colorPicker.value = this.dataset.color;
      typeSpeechMessage(`Je hebt ${this.dataset.name} gekozen! Een mooie kleur!`);
    });
  });
  
  // Initialiseer met een wit canvas
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
