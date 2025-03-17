document.addEventListener('DOMContentLoaded', function() {
  // Hoofdelementen
  const canvasContainer = document.getElementById('canvas-container');
  const coloringCanvas = document.getElementById('coloring-canvas');
  const ctx = coloringCanvas.getContext('2d');
  
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
  canvasContainer.style.position = 'relative';
  canvasContainer.style.flex = '1'; // Laat het canvas container element groeien
  canvasContainer.style.display = 'flex'; // Zorg ervoor dat het canvas kan uitrekken
  canvasContainer.style.width = '100%';
  canvasContainer.style.height = '100%';
  canvasContainer.style.margin = '0'; // Verwijder alle marges
  canvasContainer.style.padding = '0'; // Verwijder alle padding
  const templateCtx = templateCanvas.getContext('2d');
  
  // UI-elementen
  const colorTools = document.querySelector('.color-tools');
  const drawingTools = document.querySelector('.drawing-tools');
  const coloringActions = document.querySelector('.coloring-actions');
  
  // Zorg ervoor dat de toolbox container bestaat - zo niet, maak hem aan
  let toolboxContainer = document.querySelector('.toolbox-container');
  if (!toolboxContainer) {
    toolboxContainer = document.createElement('div');
    toolboxContainer.className = 'toolbox-container';
    const coloringContainer = document.querySelector('.coloring-container');
    // Plaats voor het canvas-container element
    coloringContainer.insertBefore(toolboxContainer, canvasContainer);
  }
  
  // Verwijder marges en padding van body en html om scrolling te voorkomen
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.margin = '0';
  document.documentElement.style.padding = '0';
  document.documentElement.style.overflow = 'hidden';
  
  // Vervanging van bestaande tools door nieuwe interface
  colorTools.innerHTML = '';
  drawingTools.innerHTML = '';
  coloringActions.innerHTML = '';
  
  // Creëer nieuwe controlebalk
  const controls = document.createElement('div');
  controls.className = 'controls';
  controls.style.display = 'flex';
  controls.style.justifyContent = 'space-around';
  controls.style.alignItems = 'center';
  controls.style.padding = '8px'; // Iets meer padding voor betere zichtbaarheid
  controls.style.backgroundColor = '#f8f8f8'; // Solide achtergrond in plaats van transparant
  controls.style.borderTop = '1px solid #ddd';
  controls.style.borderBottom = '1px solid #ddd'; 
  controls.style.width = '100%';
  controls.style.minHeight = '40px'; // Minimale hoogte om zichtbaarheid te garanderen
  
  // Creëer bevestigingsdialoog
  const confirmDialog = document.createElement('div');
  confirmDialog.className = 'confirm-dialog';
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
  
  // Template afbeeldingen - pas de paden aan naar waar je ze opslaat
  const templates = [
    null, // Leeg vel
    'images/kleurplaten/kleurplaat-knof1.png',
    'images/kleurplaten/kleurplaat-kok1.png'
  ];
  
  // Geen eerste bezoek hint meer
  let isFirstVisit = false;
  
  // UI bouwen
  function buildUI() {
    // Maak coloring-container flexibel en vul volledige ruimte tussen menubalken
    const coloringContainer = document.querySelector('.coloring-container');
    coloringContainer.style.display = 'flex';
    coloringContainer.style.flexDirection = 'column';
    coloringContainer.style.height = '100%';
    coloringContainer.style.margin = '0';
    coloringContainer.style.padding = '0';
    coloringContainer.style.width = '100%';
    
    // Stijl voor de toolbox container - zorg voor duidelijke zichtbaarheid
    toolboxContainer.style.width = '100%';
    toolboxContainer.style.backgroundColor = '#f8f8f8';
    toolboxContainer.style.borderBottom = '1px solid #ddd';
    toolboxContainer.style.padding = '0';
    toolboxContainer.style.zIndex = '10';
    toolboxContainer.style.display = 'block'; // Zorg dat het zichtbaar is
    toolboxContainer.style.minHeight = '50px'; // Garandeer minimum hoogte
    
    // App container moet ook maximale ruimte benutten
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.style.height = '100%';
      appContainer.style.margin = '0';
      appContainer.style.padding = '0';
      appContainer.style.display = 'flex';
      appContainer.style.flexDirection = 'column';
      appContainer.style.overflow = 'hidden';
    }
    
    // Verwijder margin en verminder padding van page-title om ruimte te besparen
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
      pageTitle.style.margin = '0';
      pageTitle.style.padding = '2px 0';
      pageTitle.style.fontSize = '24px';
    }

    // Kleurenkiezer knop en container
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.style.position = 'relative';
    
    const colorPickerButton = document.createElement('button');
    colorPickerButton.textContent = '🎨';
    colorPickerButton.className = 'control-button';
    colorPickerButton.style.fontSize = '24px';
    colorPickerButton.style.background = 'none';
    colorPickerButton.style.border = 'none';
    colorPickerButton.style.cursor = 'pointer';
    colorPickerButton.style.padding = '5px';
    
    const colorPickerMenu = document.createElement('div');
    colorPickerMenu.className = 'color-picker-menu';
    colorPickerMenu.style.display = 'none';
    colorPickerMenu.style.flexWrap = 'wrap';
    colorPickerMenu.style.justifyContent = 'center';
    colorPickerMenu.style.position = 'absolute';
    colorPickerMenu.style.top = '100%';
    colorPickerMenu.style.left = '50%';
    colorPickerMenu.style.transform = 'translateX(-50%)';
    colorPickerMenu.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    colorPickerMenu.style.borderRadius = '10px';
    colorPickerMenu.style.padding = '5px';
    colorPickerMenu.style.marginTop = '5px';
    colorPickerMenu.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    colorPickerMenu.style.zIndex = '100';
    
    colors.forEach(color => {
      const colorOption = document.createElement('div');
      colorOption.className = 'color-option';
      colorOption.style.width = '30px';
      colorOption.style.height = '30px';
      colorOption.style.borderRadius = '50%';
      colorOption.style.border = '2px solid white';
      colorOption.style.margin = '2px';
      colorOption.style.cursor = 'pointer';
      colorOption.style.backgroundColor = color;
      
      colorOption.addEventListener('click', (e) => {
        e.stopPropagation();
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
    });
    
    colorPickerContainer.appendChild(colorPickerButton);
    colorPickerContainer.appendChild(colorPickerMenu);
    controls.appendChild(colorPickerContainer);
    
    // Penseelgrootte knop en container
    const brushSizeContainer = document.createElement('div');
    brushSizeContainer.style.position = 'relative';
    
    const brushSizeButton = document.createElement('button');
    brushSizeButton.textContent = '🖌️';
    brushSizeButton.className = 'control-button';
    brushSizeButton.style.fontSize = '24px';
    brushSizeButton.style.background = 'none';
    brushSizeButton.style.border = 'none';
    brushSizeButton.style.cursor = 'pointer';
    brushSizeButton.style.padding = '5px';
    
    const brushSizeMenu = document.createElement('div');
    brushSizeMenu.className = 'brush-size-menu';
    brushSizeMenu.style.display = 'none';
    brushSizeMenu.style.flexDirection = 'column-reverse';
    brushSizeMenu.style.position = 'absolute';
    brushSizeMenu.style.top = '100%';
    brushSizeMenu.style.left = '50%';
    brushSizeMenu.style.transform = 'translateX(-50%)';
    brushSizeMenu.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    brushSizeMenu.style.borderRadius = '10px';
    brushSizeMenu.style.padding = '5px';
    brushSizeMenu.style.marginTop = '5px';
    brushSizeMenu.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    brushSizeMenu.style.zIndex = '100';
    
    brushSizes.forEach(size => {
      const sizeOption = document.createElement('button');
      sizeOption.className = 'brush-size-option';
      sizeOption.style.fontSize = `${size * 2}px`;
      sizeOption.style.background = 'none';
      sizeOption.style.border = 'none';
      sizeOption.style.cursor = 'pointer';
      sizeOption.style.padding = '5px';
      sizeOption.textContent = '🖌️';
      
      sizeOption.addEventListener('click', (e) => {
        e.stopPropagation();
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
    });
    
    brushSizeContainer.appendChild(brushSizeButton);
    brushSizeContainer.appendChild(brushSizeMenu);
    controls.appendChild(brushSizeContainer);
    
    // Undo knop
    const undoButton = document.createElement('button');
    undoButton.textContent = '↩️';
    undoButton.className = 'control-button';
    undoButton.style.fontSize = '24px';
    undoButton.style.background = 'none';
    undoButton.style.border = 'none';
    undoButton.style.cursor = 'pointer';
    undoButton.style.padding = '5px';
    
    undoButton.addEventListener('click', undo);
    controls.appendChild(undoButton);
    
    // Wis knop
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑️';
    clearButton.className = 'control-button';
    clearButton.style.fontSize = '24px';
    clearButton.style.background = 'none';
    clearButton.style.border = 'none';
    clearButton.style.cursor = 'pointer';
    clearButton.style.padding = '5px';
    
    clearButton.addEventListener('click', handleClearCanvas);
    controls.appendChild(clearButton);
    
    // Download knop
    const downloadButton = document.createElement('button');
    downloadButton.textContent = '💾';
    downloadButton.className = 'control-button';
    downloadButton.style.fontSize = '24px';
    downloadButton.style.background = 'none';
    downloadButton.style.border = 'none';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.padding = '5px';
    
    downloadButton.addEventListener('click', downloadImage);
    controls.appendChild(downloadButton);
    
    // Template knop en container
    const templateContainer = document.createElement('div');
    templateContainer.style.position = 'relative';
    
    const templateButton = document.createElement('button');
    templateButton.textContent = '🖼️';
    templateButton.className = 'control-button';
    templateButton.style.fontSize = '24px';
    templateButton.style.background = 'none';
    templateButton.style.border = 'none';
    templateButton.style.cursor = 'pointer';
    templateButton.style.padding = '5px';
    
    const templateMenu = document.createElement('div');
    templateMenu.className = 'template-menu';
    templateMenu.style.display = 'none';
    templateMenu.style.flexDirection = 'column';
    templateMenu.style.position = 'absolute';
    templateMenu.style.top = '100%';
    templateMenu.style.left = '50%';
    templateMenu.style.transform = 'translateX(-50%)';
    templateMenu.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    templateMenu.style.padding = '5px';
    templateMenu.style.borderRadius = '5px';
    templateMenu.style.marginTop = '5px';
    templateMenu.style.zIndex = '100';
    
    templates.forEach((template, index) => {
      const templateOption = document.createElement('div');
      templateOption.className = 'template-option';
      templateOption.style.width = '60px';
      templateOption.style.height = '60px';
      templateOption.style.border = '2px solid #ccc';
      templateOption.style.borderRadius = '5px';
      templateOption.style.margin = '5px 0';
      templateOption.style.cursor = 'pointer';
      templateOption.style.display = 'flex';
      templateOption.style.justifyContent = 'center';
      templateOption.style.alignItems = 'center';
      templateOption.style.overflow = 'hidden';
      
      if (template === null) {
        templateOption.style.backgroundColor = '#f0f0f0';
        const plusSign = document.createElement('span');
        plusSign.style.fontSize = '24px';
        plusSign.textContent = '➕';
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
      
      templateOption.addEventListener('click', (e) => {
        e.stopPropagation();
        selectTemplate(template);
      });
      
      templateMenu.appendChild(templateOption);
    });
    
    templateButton.addEventListener('click', (e) => {
      e.stopPropagation();
      templateMenu.style.display = templateMenu.style.display === 'flex' ? 'none' : 'flex';
      colorPickerMenu.style.display = 'none';
      brushSizeMenu.style.display = 'none';
    });
    
    templateContainer.appendChild(templateButton);
    templateContainer.appendChild(templateMenu);
    controls.appendChild(templateContainer);
    
    // Voeg controls toe aan de toolboxContainer
    toolboxContainer.innerHTML = ''; // Maak zeker dat de container leeg is
    toolboxContainer.appendChild(controls);
    
    // Bevestigingsdialoog knoppen
    document.getElementById('confirm-yes').addEventListener('click', confirmClearCanvas);
    document.getElementById('confirm-no').addEventListener('click', () => {
      confirmDialog.style.display = 'none';
    });
    
    // Klikken buiten de menu's sluit ze
    document.addEventListener('click', () => {
      colorPickerMenu.style.display = 'none';
      brushSizeMenu.style.display = 'none';
      templateMenu.style.display = 'none';
    });
  }
  
  // Canvas grootte bijwerken
  function updateCanvasSize() {
    // Print debug info naar console
    console.log("updateCanvasSize uitgevoerd");
    
    // Kleine vertraging om te zorgen dat alle elementen goed geladen zijn
    setTimeout(() => {
      // Log toolbox zichtbaarheid
      console.log("Toolbox bestaat:", !!toolboxContainer);
      console.log("Toolbox hoogte:", toolboxContainer.offsetHeight);
      
      // Force direct update voor alle container hoogtes
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        appContainer.style.height = '100%';
        appContainer.style.overflow = 'hidden';
        appContainer.style.margin = '0';
        appContainer.style.padding = '0';
      }
      
      // Verzamel alle elementen die hoogte in beslag nemen
      const topNav = document.getElementById('top-nav-container');
      const bottomNav = document.getElementById('bottom-nav-container');
      
      // Bereken hoogtes
      const topNavHeight = topNav ? topNav.offsetHeight : 0;
      const bottomNavHeight = bottomNav ? bottomNav.offsetHeight : 0;
      const toolboxHeight = toolboxContainer ? toolboxContainer.offsetHeight : 0;
      
      console.log("topNavHeight:", topNavHeight);
      console.log("bottomNavHeight:", bottomNavHeight);
      console.log("toolboxHeight:", toolboxHeight);
      
      // Bereken exacte beschikbare ruimte
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - topNavHeight - bottomNavHeight - toolboxHeight;
      
      console.log("windowHeight:", windowHeight);
      console.log("availableHeight:", availableHeight);
      
      // Stel canvas container hoogte in op beschikbare ruimte
      canvasContainer.style.height = `${availableHeight}px`;
      
      // Directe update voor de app-container
      if (appContainer) {
        appContainer.style.height = 'calc(100% - ' + (topNavHeight + bottomNavHeight) + 'px)';
      }
      
      // Pas canvas grootte aan
      coloringCanvas.width = canvasContainer.clientWidth;
      coloringCanvas.height = canvasContainer.clientHeight;
      templateCanvas.width = coloringCanvas.width;
      templateCanvas.height = coloringCanvas.height;
      
      // Teken opnieuw na resize
      redrawCanvas();
    }, 10);
  }
  
  // Teken starten
  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    
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
      // Voor de eerste twee punten, teken een rechte lijn
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
    } else {
      // Gebruik een quadratische curve voor vloeiende lijnen
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
        templateCtx.drawImage(img, 0, 0, templateCanvas.width, templateCanvas.height);
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
    const templateMenu = document.querySelector('.template-menu');
    if (templateMenu) templateMenu.style.display = 'none';
    
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
    
    // Force een onmiddellijke resize bij orientatie verandering
    window.addEventListener('orientationchange', function() {
      setTimeout(updateCanvasSize, 300); // Langere timeout bij oriëntatieverandering
    });
    
    // Observeer veranderingen in de menubalk hoogtes
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        updateCanvasSize();
      });
      
      if (document.getElementById('top-nav-container')) {
        resizeObserver.observe(document.getElementById('top-nav-container'));
      }
      if (document.getElementById('bottom-nav-container')) {
        resizeObserver.observe(document.getElementById('bottom-nav-container'));
      }
      if (toolboxContainer) {
        resizeObserver.observe(toolboxContainer);
      }
    }
  }
  
  // Initialisatie
  function init() {
    console.log("App initialisatie gestart");
    
    // Bouw UI
    buildUI();
    
    // Canvas voorbereiden en onmiddellijk grootte aanpassen
    setTimeout(updateCanvasSize, 0);
    
    // Teken witte achtergrond
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, coloringCanvas.width, coloringCanvas.height);
    
    // Event listeners toevoegen
    addEventListeners();
    
    // Tweede keer updateCanvasSize aanroepen na een korte vertraging
    setTimeout(updateCanvasSize, 300);
    
    // Derde keer voor de zekerheid
    setTimeout(updateCanvasSize, 800);
    
    console.log("App initialisatie voltooid");
  }
  
  // Start de applicatie
  init();
});
