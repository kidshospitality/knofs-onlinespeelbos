document.addEventListener('DOMContentLoaded', function() {
  // Hoofdelementen
  const canvasContainer = document.getElementById('canvas-container');
  const coloringCanvas = document.getElementById('coloring-canvas');
  const ctx = coloringCanvas.getContext('2d');
  const drawingToolbar = document.getElementById('drawing-toolbar');
  
  // NIEUW: Berichten die Knof kan zeggen
  const knofMessages = {
    colorPicker: [
      "Welke kleur wil je gebruiken? Ik vind rood heel mooi!",
      "Kies maar een leuke kleur, ik ben benieuwd!",
      "Kleuren kiezen is zo leuk! Wat wordt het?"
    ],
    brushSize: [
      "Een dikke of dunne lijn? Jij mag kiezen!",
      "Wil je dikke of dunne strepen maken?",
      "Met een grote kwast kun je veel sneller kleuren!"
    ],
    undo: [
      "Oeps, foutje? Geen probleem!",
      "We maken allemaal wel eens een foutje...",
      "Terug naar de vorige stap, handig hè?"
    ],
    clear: [
      "Wil je echt helemaal opnieuw beginnen?",
      "Alles wissen? Ben je zeker?",
      "Soms is het leuk om met een schone lei te beginnen!"
    ],
    download: [
      "Je kunt je tekening opslaan en later printen!",
      "Zullen we je kunstwerk bewaren?",
      "Laat je tekening maar zien aan iedereen!"
    ],
    template: [
      "Kies maar een leuke kleurplaat uit!",
      "Welke kleurplaat vind jij het leukst?",
      "Er zijn verschillende kleurplaten, kies er maar eentje!"
    ],
    drawing: [
      "Wat ben je mooi aan het tekenen!",
      "Je bent echt goed in kleuren!",
      "Ik ben benieuwd hoe je tekening eruit gaat zien!"
    ]
  };
  
  // NIEUW: Functie om een willekeurig bericht te tonen via de bestaande typeSpeechMessage functie
  function showKnofMessage(messageType) {
    const messages = knofMessages[messageType];
    const randomIndex = Math.floor(Math.random() * messages.length);
    const message = messages[randomIndex];
    
    // Controleer of typeSpeechMessage bestaat (komt uit common.js)
    if (typeof typeSpeechMessage === 'function') {
      typeSpeechMessage(message);
    }
  }
  
  // Creëer het sjablooncanvas
  const templateCanvas = document.createElement('canvas');
  templateCanvas.id = 'template-canvas';
  templateCanvas.style.position = 'absolute';
  templateCanvas.style.top = '0';
  templateCanvas.style.left = '0';
  templateCanvas.style.pointerEvents = 'none';
  templateCanvas.style.width = '100%';
  templateCanvas.style.height = '100%';
  canvasContainer.appendChild(templateCanvas);
  const templateCtx = templateCanvas.getContext('2d');
  
  // Creëer bevestigingsdialoog
  const confirmDialog = document.createElement('div');
  confirmDialog.style.display = 'none';
  confirmDialog.style.position = 'fixed';
  confirmDialog.style.top = '50%';
  confirmDialog.style.left = '50%';
  confirmDialog.style.transform = 'translate(-50%, -50%)';
  confirmDialog.style.backgroundColor = 'white';
  confirmDialog.style.padding = '20px';
  confirmDialog.style.borderRadius = '10px';
  confirmDialog.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
  confirmDialog.style.zIndex = '1000';
  confirmDialog.style.flexDirection = 'column';
  confirmDialog.style.alignItems = 'center';
  document.body.appendChild(confirmDialog);
  
  confirmDialog.innerHTML = `
    <p>Weet je zeker dat je de tekening wilt wissen?</p>
    <div style="display: flex;">
      <button id="confirm-yes" style="margin: 10px; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; color: white; background-color: #4CAF50;">Ja</button>
      <button id="confirm-no" style="margin: 10px; padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; color: white; background-color: #f44336;">Nee</button>
    </div>
  `;
  
  // Staat
  let currentColor = '#000000';
  let brushSize = 8;
  let isDrawing = false;
  let paths = [];
  let currentPath = null;
  let drawHistory = [];
  let currentHistoryIndex = -1;
  let selectedTemplate = null;
  
  // Beschikbare kleuren
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];
  
  // Penseel groottes
  const brushSizes = [3, 8, 15];
  
  // Template afbeeldingen
  const templates = [
    null, // Leeg vel
    'images/kleurplaten/kleurplaat-knof1.png',
    'images/kleurplaten/kleurplaat-kok1.png'
  ];
  
  // NIEUWE FUNCTIE: Bouw de toolbar
  function buildToolbar() {
    // Maak toolbar leeg
    drawingToolbar.innerHTML = '';
    
    // Kleurenkiezer
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.style.position = 'relative';
    
    const colorPickerButton = document.createElement('button');
    colorPickerButton.textContent = '🎨';
    colorPickerButton.style.fontSize = '24px';
    colorPickerButton.style.background = 'none';
    colorPickerButton.style.border = 'none';
    colorPickerButton.style.cursor = 'pointer';
    
    const colorPickerMenu = document.createElement('div');
    colorPickerMenu.style.display = 'none';
    colorPickerMenu.style.position = 'absolute';
    colorPickerMenu.style.top = '100%';
    colorPickerMenu.style.left = '50%';
    colorPickerMenu.style.transform = 'translateX(-50%)';
    colorPickerMenu.style.backgroundColor = 'white';
    colorPickerMenu.style.borderRadius = '5px';
    colorPickerMenu.style.padding = '5px';
    colorPickerMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    colorPickerMenu.style.zIndex = '100';
    colorPickerMenu.style.display = 'none';
    colorPickerMenu.style.flexWrap = 'wrap';
    colorPickerMenu.style.width = '120px';
    colorPickerMenu.style.justifyContent = 'center';
    
    colors.forEach(color => {
      const colorOption = document.createElement('div');
      colorOption.style.width = '30px';
      colorOption.style.height = '30px';
      colorOption.style.margin = '2px';
      colorOption.style.borderRadius = '50%';
      colorOption.style.backgroundColor = color;
      colorOption.style.border = '2px solid #ddd';
      colorOption.style.cursor = 'pointer';
      
      colorOption.addEventListener('click', () => {
        currentColor = color;
        colorPickerMenu.style.display = 'none';
      });
      
      colorPickerMenu.appendChild(colorOption);
    });
    
    colorPickerButton.addEventListener('click', (e) => {
      e.stopPropagation();
      colorPickerMenu.style.display = colorPickerMenu.style.display === 'flex' ? 'none' : 'flex';
      brushSizeMenu.style.display = 'none';
      templateMenu.style.display = 'none';
      showKnofMessage('colorPicker');
    });
    
    colorPickerContainer.appendChild(colorPickerButton);
    colorPickerContainer.appendChild(colorPickerMenu);
    drawingToolbar.appendChild(colorPickerContainer);
    
    // Penseelgrootte
    const brushSizeContainer = document.createElement('div');
    brushSizeContainer.style.position = 'relative';
    
    const brushSizeButton = document.createElement('button');
    brushSizeButton.textContent = '🖌️';
    brushSizeButton.style.fontSize = '24px';
    brushSizeButton.style.background = 'none';
    brushSizeButton.style.border = 'none';
    brushSizeButton.style.cursor = 'pointer';
    
    const brushSizeMenu = document.createElement('div');
    brushSizeMenu.style.display = 'none';
    brushSizeMenu.style.position = 'absolute';
    brushSizeMenu.style.top = '100%';
    brushSizeMenu.style.left = '50%';
    brushSizeMenu.style.transform = 'translateX(-50%)';
    brushSizeMenu.style.backgroundColor = 'white';
    brushSizeMenu.style.borderRadius = '5px';
    brushSizeMenu.style.padding = '5px';
    brushSizeMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    brushSizeMenu.style.zIndex = '100';
    brushSizeMenu.style.flexDirection = 'column';
    
    brushSizes.forEach(size => {
      const sizeOption = document.createElement('button');
      sizeOption.textContent = '🖌️';
      sizeOption.style.fontSize = `${size * 1.5}px`;
      sizeOption.style.background = 'none';
      sizeOption.style.border = 'none';
      sizeOption.style.cursor = 'pointer';
      sizeOption.style.padding = '5px 10px';
      
      sizeOption.addEventListener('click', () => {
        brushSize = size;
        brushSizeMenu.style.display = 'none';
      });
      
      brushSizeMenu.appendChild(sizeOption);
    });
    
    brushSizeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      brushSizeMenu.style.display = brushSizeMenu.style.display === 'flex' ? 'none' : 'flex';
      colorPickerMenu.style.display = 'none';
      templateMenu.style.display = 'none';
      showKnofMessage('brushSize');
    });
    
    brushSizeContainer.appendChild(brushSizeButton);
    brushSizeContainer.appendChild(brushSizeMenu);
    drawingToolbar.appendChild(brushSizeContainer);
    
    // Undo knop
    const undoButton = document.createElement('button');
    undoButton.textContent = '↩️';
    undoButton.style.fontSize = '24px';
    undoButton.style.background = 'none';
    undoButton.style.border = 'none';
    undoButton.style.cursor = 'pointer';
    undoButton.addEventListener('click', () => {
      undo();
      showKnofMessage('undo');
    });
    drawingToolbar.appendChild(undoButton);
    
    // Wis knop
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑️';
    clearButton.style.fontSize = '24px';
    clearButton.style.background = 'none';
    clearButton.style.border = 'none';
    clearButton.style.cursor = 'pointer';
    clearButton.addEventListener('click', () => {
      handleClearCanvas();
      showKnofMessage('clear');
    });
    drawingToolbar.appendChild(clearButton);
    
    // Download knop
    const downloadButton = document.createElement('button');
    downloadButton.textContent = '💾';
    downloadButton.style.fontSize = '24px';
    downloadButton.style.background = 'none';
    downloadButton.style.border = 'none';
    downloadButton.style.cursor = 'pointer';
    downloadButton.addEventListener('click', () => {
      downloadImage();
      showKnofMessage('download');
    });
    drawingToolbar.appendChild(downloadButton);
    
    // Template knop
    const templateContainer = document.createElement('div');
    templateContainer.style.position = 'relative';
    
    const templateButton = document.createElement('button');
    templateButton.textContent = '🖼️';
    templateButton.style.fontSize = '24px';
    templateButton.style.background = 'none';
    templateButton.style.border = 'none';
    templateButton.style.cursor = 'pointer';
    
    const templateMenu = document.createElement('div');
    templateMenu.style.display = 'none';
    templateMenu.style.position = 'absolute';
    templateMenu.style.top = '100%';
    templateMenu.style.left = '50%';
    templateMenu.style.transform = 'translateX(-50%)';
    templateMenu.style.backgroundColor = 'white';
    templateMenu.style.borderRadius = '5px';
    templateMenu.style.padding = '5px';
    templateMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    templateMenu.style.zIndex = '100';
    templateMenu.style.flexDirection = 'column';
    
    templates.forEach((template, index) => {
      const templateOption = document.createElement('div');
      templateOption.style.width = '60px';
      templateOption.style.height = '60px';
      templateOption.style.margin = '5px 0';
      templateOption.style.borderRadius = '5px';
      templateOption.style.border = '2px solid #ddd';
      templateOption.style.cursor = 'pointer';
      templateOption.style.overflow = 'hidden';
      templateOption.style.display = 'flex';
      templateOption.style.justifyContent = 'center';
      templateOption.style.alignItems = 'center';
      
      if (template === null) {
        templateOption.style.backgroundColor = '#f0f0f0';
        const plusSign = document.createElement('div');
        plusSign.textContent = '➕';
        plusSign.style.fontSize = '24px';
        templateOption.appendChild(plusSign);
      } else {
        const img = document.createElement('img');
        img.src = template;
        img.alt = `Template ${index}`;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        templateOption.appendChild(img);
      }
      
      templateOption.addEventListener('click', () => {
        selectTemplate(template);
        templateMenu.style.display = 'none';
      });
      
      templateMenu.appendChild(templateOption);
    });
    
    templateButton.addEventListener('click', (e) => {
      e.stopPropagation();
      templateMenu.style.display = templateMenu.style.display === 'flex' ? 'none' : 'flex';
      colorPickerMenu.style.display = 'none';
      brushSizeMenu.style.display = 'none';
      showKnofMessage('template');
    });
    
    templateContainer.appendChild(templateButton);
    templateContainer.appendChild(templateMenu);
    drawingToolbar.appendChild(templateContainer);
    
    // Klikken buiten menu's sluit ze
    document.addEventListener('click', () => {
      colorPickerMenu.style.display = 'none';
      brushSizeMenu.style.display = 'none';
      templateMenu.style.display = 'none';
    });
    
    // Bevestigingsdialoog knoppen
    document.getElementById('confirm-yes').addEventListener('click', confirmClearCanvas);
    document.getElementById('confirm-no').addEventListener('click', () => {
      confirmDialog.style.display = 'none';
    });
  }
  
  // Update canvas grootte
  function updateCanvasSize() {
    // Kleine vertraging om te zorgen dat alle elementen goed geladen zijn
    setTimeout(() => {
      // Verzamel hoogtes
      const topNavHeight = document.getElementById('top-nav-container').offsetHeight || 0;
      const bottomNavHeight = document.getElementById('bottom-nav-container').offsetHeight || 0;
      const toolbarHeight = drawingToolbar.offsetHeight || 0;
      
      // Bereken beschikbare ruimte
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - topNavHeight - bottomNavHeight - toolbarHeight;
      
      // Update canvas container
      canvasContainer.style.height = `${availableHeight}px`;
      
      // Update canvas
      coloringCanvas.width = canvasContainer.clientWidth;
      coloringCanvas.height = canvasContainer.clientHeight;
      templateCanvas.width = coloringCanvas.width;
      templateCanvas.height = coloringCanvas.height;
      
      // Teken canvas opnieuw
      redrawCanvas();
    }, 50);
  }
  
  // Teken starten
  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    
    // NIEUW: Toon af en toe een bericht tijdens het tekenen
    if (Math.random() < 0.3) { // 30% kans om bericht te tonen tijdens tekenen
      showKnofMessage('drawing');
    }
    
    const rect = coloringCanvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    currentPath = { 
      color: currentColor, 
      size: brushSize, 
      points: [{ x, y }] 
    };
    
    // Begin tekenpad
    ctx.beginPath();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  
  // Teken verdergaan
  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const rect = coloringCanvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    // Voeg punt toe aan pad
    currentPath.points.push({ x, y });
    
    // Tekenen met vloeiende lijnen
    const pointCount = currentPath.points.length;
    if (pointCount < 2) return;
    
    ctx.beginPath();
    ctx.lineWidth = currentPath.size;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentPath.color;
    
    const lastPoint = currentPath.points[pointCount - 2];
    const currentPoint = currentPath.points[pointCount - 1];
    
    if (pointCount < 3) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
    } else {
      const controlX = (lastPoint.x + currentPoint.x) / 2;
      const controlY = (lastPoint.y + currentPoint.y) / 2;
      
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.quadraticCurveTo(controlX, controlY, currentPoint.x, currentPoint.y);
    }
    
    ctx.stroke();
  }
  
  // Teken stoppen
  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    
    if (currentPath && currentPath.points.length > 0) {
      paths.push(currentPath);
      
      // Update tekening geschiedenis
      const newHistory = drawHistory.slice(0, currentHistoryIndex + 1);
      newHistory.push([...paths]);
      drawHistory = newHistory;
      currentHistoryIndex = newHistory.length - 1;
    }
    
    currentPath = null;
  }
  
  // Canvas opnieuw tekenen
  function redrawCanvas() {
    // Schoon canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, coloringCanvas.width, coloringCanvas.height);
    
    // Teken alle paden
    drawPaths();
    
    // Schoon template canvas
    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    
    // Teken sjabloon als er één is geselecteerd
    if (selectedTemplate) {
      const img = new Image();
      img.onload = function() {
        // Bereken de juiste afmetingen om de aspectverhouding te behouden
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = templateCanvas.width / templateCanvas.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        // Schaal alleen naar hoogte
        drawHeight = templateCanvas.height;
        drawWidth = drawHeight * imgAspectRatio;
        
        // Centreer horizontaal als de breedte kleiner is dan het canvas
        offsetX = (templateCanvas.width - drawWidth) / 2;
        offsetY = 0;
        
        // Als de berekende breedte groter is dan de canvas breedte,
        // pas dan de breedte aan en centreer verticaal
        if (drawWidth > templateCanvas.width) {
          drawWidth = templateCanvas.width;
          drawHeight = drawWidth / imgAspectRatio;
          offsetX = 0;
          offsetY = (templateCanvas.height - drawHeight) / 2;
        }
        
        // Teken de afbeelding met de juiste afmetingen en positie
        templateCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      };
      img.src = selectedTemplate;
    }
  }
  
  // Teken alle opgeslagen paden
  function drawPaths() {
    const currentPaths = currentHistoryIndex >= 0 ? drawHistory[currentHistoryIndex] : [];
    currentPaths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.strokeStyle = path.color;
      
      // Begin met het eerste punt
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      // Voor elk volgend punt, teken vloeiende lijnen
      for (let i = 1; i < path.points.length; i++) {
        if (i === 1) {
          // Eerste segment is een rechte lijn
          ctx.lineTo(path.points[i].x, path.points[i].y);
        } else {
          // Volgende segmenten gebruiken quadratische curves
          const controlX = (path.points[i-1].x + path.points[i].x) / 2;
          const controlY = (path.points[i-1].y + path.points[i].y) / 2;
          ctx.quadraticCurveTo(controlX, controlY, path.points[i].x, path.points[i].y);
        }
      }
      
      ctx.stroke();
    });
  }
  
  // Undo functie
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
  
  // Wis canvas bevestiging tonen
  function handleClearCanvas() {
    confirmDialog.style.display = 'flex';
  }
  
  // Canvas wissen bevestigd
  function confirmClearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, coloringCanvas.width, coloringCanvas.height);
    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    
    paths = [];
    drawHistory = [];
    currentHistoryIndex = -1;
    selectedTemplate = null;
    
    confirmDialog.style.display = 'none';
  }
  
  // Afbeelding downloaden
  function downloadImage() {
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = coloringCanvas.width;
    downloadCanvas.height = coloringCanvas.height;
    const downloadCtx = downloadCanvas.getContext('2d');
    
    // Teken de kleuren
    downloadCtx.drawImage(coloringCanvas, 0, 0);
    
    // Teken de sjabloon er bovenop
    downloadCtx.drawImage(templateCanvas, 0, 0);
    
    // Download
    const link = document.createElement('a');
    link.download = 'mijn_kleurplaat.png';
    link.href = downloadCanvas.toDataURL();
    link.click();
  }
  
  // Sjabloon selecteren
  function selectTemplate(template) {
    selectedTemplate = template;
    
    // Reset tekening
    paths = [];
    drawHistory = [];
    currentHistoryIndex = -1;
    
    redrawCanvas();
  }
  
  // Event listeners toevoegen
  function addEventListeners() {
    // Canvas events
    coloringCanvas.addEventListener('mousedown', startDrawing);
    coloringCanvas.addEventListener('mousemove', draw);
    coloringCanvas.addEventListener('mouseup', stopDrawing);
    coloringCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    coloringCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    coloringCanvas.addEventListener('touchmove', draw, { passive: false });
    coloringCanvas.addEventListener('touchend', stopDrawing);
    
    // Resize event
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', () => setTimeout(updateCanvasSize, 300));
  }
  
  // Initialisatie
  function init() {
    // Bouw toolbar
    buildToolbar();
    
    // Canvas voorbereiden
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, coloringCanvas.width, coloringCanvas.height);
    
    // Event listeners toevoegen
    addEventListeners();
    
    // Canvas grootte aanpassen
    updateCanvasSize();
    
    // NIEUW: Toon welkomstbericht
    showKnofMessage('welcome');
    
    // Extra updateCanvasSize aanroepen na korte vertraging
    setTimeout(updateCanvasSize, 300);
  }
  
  // Start de applicatie
  init();
});
