document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const quoteTextEl = document.getElementById('quoteText');
    const fontFamilyEl = document.getElementById('fontFamily');
    const fontSizeEl = document.getElementById('fontSize');
    const fontSizeValueEl = document.getElementById('fontSizeValue');
    const fontColorEl = document.getElementById('fontColor');
    const textAlignButtons = document.querySelectorAll('.align-btn');
    const textYPositionEl = document.getElementById('textYPosition');
    const textYPositionValueEl = document.getElementById('textYPositionValue');

    const textGlowEl = document.getElementById('textGlow');
    const glowOptionsEl = document.getElementById('glowOptions');
    const glowColorEl = document.getElementById('glowColor');
    const glowBlurEl = document.getElementById('glowBlur');
    const glowBlurValueEl = document.getElementById('glowBlurValue');

    const textOutlineEl = document.getElementById('textOutline');
    const outlineOptionsEl = document.getElementById('outlineOptions');
    const outlineColorEl = document.getElementById('outlineColor');
    const outlineWidthEl = document.getElementById('outlineWidth');
    const outlineWidthValueEl = document.getElementById('outlineWidthValue');

    const bgTypeEl = document.getElementById('bgType');
    const bgColorGroupEl = document.getElementById('bgColorGroup');
    const bgColorEl = document.getElementById('bgColor');
    const bgImageGroupEl = document.getElementById('bgImageGroup');
    const bgImageEl = document.getElementById('bgImage');
    const imageBrightnessEl = document.getElementById('imageBrightness');
    const imageBrightnessValueEl = document.getElementById('imageBrightnessValue');


    const canvasEl = document.getElementById('quoteCanvas');
    const ctx = canvasEl.getContext('2d');

    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const applyCanvasSizeBtn = document.getElementById('applyCanvasSize');

    const downloadBtn = document.getElementById('downloadBtn');
    const saveToHistoryBtn = document.getElementById('saveToHistoryBtn');
    const toggleHistoryBtn = document.getElementById('toggleHistory');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const quoteHistoryEl = document.getElementById('quoteHistory');

    // --- State Variables ---
    let currentBgImage = null;
    let currentTextAlign = 'center';
    let quoteHistory = JSON.parse(localStorage.getItem('quoteHistory')) || [];

    // --- Initial Setup ---
    const initialCanvasWidth = 600;
    const initialCanvasHeight = 400;
    canvasEl.width = initialCanvasWidth;
    canvasEl.height = initialCanvasHeight;
    canvasWidthInput.value = initialCanvasWidth;
    canvasHeightInput.value = initialCanvasHeight;


    // --- Canvas Drawing Function ---
    function drawCanvas() {
        // Clear canvas
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        // Background
        if (bgTypeEl.value === 'image' && currentBgImage && currentBgImage.complete) {
            // Apply brightness filter
            const brightness = imageBrightnessEl.value / 100;
            ctx.filter = `brightness(${brightness})`;
            
            // Draw image, maintaining aspect ratio and covering canvas
            const canvasAspect = canvasEl.width / canvasEl.height;
            const imageAspect = currentBgImage.width / currentBgImage.height;
            let sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight;

            if (canvasAspect > imageAspect) { // Canvas is wider than image
                sWidth = currentBgImage.width;
                sHeight = currentBgImage.width / canvasAspect;
                sx = 0;
                sy = (currentBgImage.height - sHeight) / 2;
            } else { // Canvas is taller or same aspect as image
                sHeight = currentBgImage.height;
                sWidth = currentBgImage.height * canvasAspect;
                sy = 0;
                sx = (currentBgImage.width - sWidth) / 2;
            }
            dx = 0;
            dy = 0;
            dWidth = canvasEl.width;
            dHeight = canvasEl.height;
            
            ctx.drawImage(currentBgImage, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            ctx.filter = 'none'; // Reset filter
        } else {
            ctx.fillStyle = bgColorEl.value;
            ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        }

        // Text properties
        const text = quoteTextEl.value;
        const fontSize = fontSizeEl.value;
        const fontFamily = fontFamilyEl.value;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fontColorEl.value;
        ctx.textAlign = currentTextAlign;

        // Text effects
        if (textGlowEl.checked) {
            ctx.shadowColor = glowColorEl.value;
            ctx.shadowBlur = parseInt(glowBlurEl.value);
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }

        // Calculate text position
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.2; // Approximate line height
        const totalTextHeight = lines.length * lineHeight;
        
        // Vertical position based on percentage of canvas height, adjusted for total text height
        const yPercentage = textYPositionEl.value / 100;
        let startY = (canvasEl.height - totalTextHeight) * yPercentage + (lineHeight * 0.8); // 0.8 to adjust baseline

        // Ensure text starts within canvas if it's too tall
        if (startY < lineHeight * 0.8) startY = lineHeight * 0.8;
        if (startY + totalTextHeight - (lineHeight * 0.8) > canvasEl.height) {
             startY = canvasEl.height - totalTextHeight + (lineHeight*0.8) ;
        }


        lines.forEach((line, index) => {
            let x;
            if (currentTextAlign === 'left') {
                x = 20; // Padding from left
            } else if (currentTextAlign === 'right') {
                x = canvasEl.width - 20; // Padding from right
            } else { // Center
                x = canvasEl.width / 2;
            }
            const currentLineY = startY + (index * lineHeight);

            // Outline
            if (textOutlineEl.checked) {
                ctx.strokeStyle = outlineColorEl.value;
                ctx.lineWidth = parseInt(outlineWidthEl.value);
                ctx.strokeText(line, x, currentLineY);
            }
            ctx.fillText(line, x, currentLineY);
        });
        
        // Reset shadow for next draw cycle if not used by other elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    // --- Event Listeners for Controls ---
    [quoteTextEl, fontFamilyEl, fontSizeEl, fontColorEl, glowColorEl, glowBlurEl, outlineColorEl, outlineWidthEl, bgColorEl, textYPositionEl, imageBrightnessEl].forEach(el => {
        el.addEventListener('input', drawCanvas);
        el.addEventListener('change', drawCanvas); // For color pickers
    });

    fontSizeEl.addEventListener('input', () => fontSizeValueEl.textContent = `${fontSizeEl.value}px`);
    glowBlurEl.addEventListener('input', () => glowBlurValueEl.textContent = glowBlurEl.value);
    outlineWidthEl.addEventListener('input', () => outlineWidthValueEl.textContent = outlineWidthEl.value);
    textYPositionEl.addEventListener('input', () => textYPositionValueEl.textContent = `${textYPositionEl.value}%`);
    imageBrightnessEl.addEventListener('input', () => imageBrightnessValueEl.textContent = `${imageBrightnessEl.value}%`);


    textAlignButtons.forEach(button => {
        button.addEventListener('click', () => {
            textAlignButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTextAlign = button.dataset.align;
            drawCanvas();
        });
    });

    textGlowEl.addEventListener('change', () => {
        glowOptionsEl.style.display = textGlowEl.checked ? 'block' : 'none';
        drawCanvas();
    });

    textOutlineEl.addEventListener('change', () => {
        outlineOptionsEl.style.display = textOutlineEl.checked ? 'block' : 'none';
        drawCanvas();
    });

    bgTypeEl.addEventListener('change', () => {
        if (bgTypeEl.value === 'color') {
            bgColorGroupEl.style.display = 'block';
            bgImageGroupEl.style.display = 'none';
            currentBgImage = null; // Clear loaded image if switching to color
        } else {
            bgColorGroupEl.style.display = 'none';
            bgImageGroupEl.style.display = 'block';
        }
        drawCanvas();
    });

    bgImageEl.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentBgImage = new Image();
                currentBgImage.onload = () => {
                    drawCanvas(); // Draw once image is loaded
                };
                currentBgImage.onerror = () => {
                    console.error("Error loading image.");
                    currentBgImage = null; // Reset if error
                    // Optionally switch back to color background or show placeholder
                    bgTypeEl.value = 'color'; 
                    bgTypeEl.dispatchEvent(new Event('change')); // Trigger change to update UI
                    alert("Failed to load image. Please try a different file.");
                };
                currentBgImage.src = e.target.result;
            };
            reader.onerror = () => {
                console.error("Error reading file.");
                alert("Failed to read image file.");
            };
            reader.readAsDataURL(file);
        }
    });
    
    applyCanvasSizeBtn.addEventListener('click', () => {
        const newWidth = parseInt(canvasWidthInput.value);
        const newHeight = parseInt(canvasHeightInput.value);
        if (newWidth >= 100 && newWidth <= 2000 && newHeight >= 100 && newHeight <= 2000) {
            canvasEl.width = newWidth;
            canvasEl.height = newHeight;
            drawCanvas();
        } else {
            alert("Please enter dimensions between 100px and 2000px.");
        }
    });


    // --- Download Functionality ---
    downloadBtn.addEventListener('click', () => {
        // Temporarily set background to ensure it's part of the downloaded image if it's transparent
        const originalBg = canvasEl.style.backgroundColor;
        if (!currentBgImage && bgColorEl.value.slice(-2) === "00" && bgColorEl.value.length === 9) { // Check for transparent hex #RRGGBBAA
             // If transparent, draw a default opaque color first
            const tempCtx = document.createElement('canvas').getContext('2d');
            tempCtx.canvas.width = canvasEl.width;
            tempCtx.canvas.height = canvasEl.height;
            tempCtx.fillStyle = '#000000'; // Opaque black
            tempCtx.fillRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            tempCtx.drawImage(canvasEl, 0, 0);
            const dataURL = tempCtx.canvas.toDataURL('image/png');
            triggerDownload(dataURL);
        } else if (!currentBgImage && ctx.fillStyle.startsWith('rgba') && ctx.fillStyle.endsWith(', 0)')) { // Check for rgba(...,0)
            const tempCtx = document.createElement('canvas').getContext('2d');
            tempCtx.canvas.width = canvasEl.width;
            tempCtx.canvas.height = canvasEl.height;
            tempCtx.fillStyle = '#000000'; // Opaque black
            tempCtx.fillRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            tempCtx.drawImage(canvasEl, 0, 0);
            const dataURL = tempCtx.canvas.toDataURL('image/png');
            triggerDownload(dataURL);
        }
        else {
             const dataURL = canvasEl.toDataURL('image/png');
             triggerDownload(dataURL);
        }
        canvasEl.style.backgroundColor = originalBg;
    });

    function triggerDownload(dataURL) {
        const link = document.createElement('a');
        link.download = 'quote-image.png';
        link.href = dataURL;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
    }


    // --- Quote History Functionality ---
    function renderHistory() {
        quoteHistoryEl.innerHTML = ''; // Clear existing items
        if (quoteHistory.length === 0) {
            quoteHistoryEl.innerHTML = '<p>No saved quotes yet.</p>';
            return;
        }
        quoteHistory.forEach((item, index) => {
            const historyItemDiv = document.createElement('div');
            historyItemDiv.classList.add('history-item');
            historyItemDiv.dataset.index = index;

            // Create a small canvas for preview
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 150; // Small preview size
            previewCanvas.height = 100;
            const prevCtx = previewCanvas.getContext('2d');
            
            // Draw a miniature version (simplified for brevity, ideally reuse drawCanvas with scaling)
            if (item.bgType === 'image' && item.bgImageSrc) {
                const img = new Image();
                img.onload = () => {
                    const imgAspect = img.width / img.height;
                    const canvAspect = previewCanvas.width / previewCanvas.height;
                    let sx=0, sy=0, sw=img.width, sh=img.height;
                    if (canvAspect > imgAspect) { sw = img.width; sh = img.width / canvAspect; sx = 0; sy = (img.height - sh) / 2; } 
                    else { sh = img.height; sw = img.height * canvAspect; sy = 0; sx = (img.width - sw) / 2; }
                    prevCtx.drawImage(img, sx, sy, sw, sh, 0, 0, previewCanvas.width, previewCanvas.height);
                    drawMiniText(prevCtx, item, previewCanvas.width, previewCanvas.height);
                }
                img.src = item.bgImageSrc; // Store DataURL of image
            } else {
                prevCtx.fillStyle = item.bgColor;
                prevCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
                drawMiniText(prevCtx, item, previewCanvas.width, previewCanvas.height);
            }
            
            historyItemDiv.appendChild(previewCanvas);

            const textPreview = document.createElement('p');
            textPreview.textContent = item.quoteText.substring(0, 30) + (item.quoteText.length > 30 ? '...' : '');
            historyItemDiv.appendChild(textPreview);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-history-item-btn');
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent loading the item when deleting
                deleteHistoryItem(index);
            };
            historyItemDiv.appendChild(deleteBtn);

            historyItemDiv.addEventListener('click', () => loadFromHistory(item));
            quoteHistoryEl.appendChild(historyItemDiv);
        });
    }
    
    function drawMiniText(pCtx, item, w, h) {
        pCtx.font = `${item.fontSize / 4}px ${item.fontFamily}`; // Scaled font size
        pCtx.fillStyle = item.fontColor;
        pCtx.textAlign = item.textAlign;
        if (item.textGlow) {
            pCtx.shadowColor = item.glowColor;
            pCtx.shadowBlur = item.glowBlur / 4; // Scaled
        }
        const lines = item.quoteText.split('\n');
        const lineHeight = (item.fontSize/4) * 1.2;
        const totalTextHeight = lines.length * lineHeight;
        const yPercentage = item.textYPosition / 100;
        let startY = (h - totalTextHeight) * yPercentage + (lineHeight * 0.8);
        if (startY < lineHeight * 0.8) startY = lineHeight * 0.8;

        lines.forEach((line, idx) => {
            let xPos;
            if (item.textAlign === 'left') xPos = 5;
            else if (item.textAlign === 'right') xPos = w - 5;
            else xPos = w / 2;
            const currentLineY = startY + (idx * lineHeight);
            if (item.textOutline) {
                pCtx.strokeStyle = item.outlineColor;
                pCtx.lineWidth = item.outlineWidth / 4 > 0.5 ? item.outlineWidth / 4 : 0.5; // Min outline
                pCtx.strokeText(line.substring(0,20), xPos, currentLineY); // Shorter text for preview
            }
            pCtx.fillText(line.substring(0,20), xPos, currentLineY);
        });
        pCtx.shadowColor = 'transparent';
        pCtx.shadowBlur = 0;
    }


    saveToHistoryBtn.addEventListener('click', () => {
        const currentSettings = {
            quoteText: quoteTextEl.value,
            fontFamily: fontFamilyEl.value,
            fontSize: fontSizeEl.value,
            fontColor: fontColorEl.value,
            textAlign: currentTextAlign,
            textYPosition: textYPositionEl.value,
            textGlow: textGlowEl.checked,
            glowColor: glowColorEl.value,
            glowBlur: glowBlurEl.value,
            textOutline: textOutlineEl.checked,
            outlineColor: outlineColorEl.value,
            outlineWidth: outlineWidthEl.value,
            bgType: bgTypeEl.value,
            bgColor: bgColorEl.value,
            bgImageSrc: (bgTypeEl.value === 'image' && currentBgImage) ? currentBgImage.src : null,
            imageBrightness: imageBrightnessEl.value,
            canvasWidth: canvasEl.width,
            canvasHeight: canvasEl.height
        };
        quoteHistory.unshift(currentSettings); // Add to the beginning
        if (quoteHistory.length > 20) quoteHistory.pop(); // Limit history size
        localStorage.setItem('quoteHistory', JSON.stringify(quoteHistory));
        renderHistory();
    });

    function loadFromHistory(item) {
        quoteTextEl.value = item.quoteText;
        fontFamilyEl.value = item.fontFamily;
        fontSizeEl.value = item.fontSize;
        fontSizeValueEl.textContent = `${item.fontSize}px`;
        fontColorEl.value = item.fontColor;
        
        textAlignButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.align === item.textAlign) {
                btn.classList.add('active');
            }
        });
        currentTextAlign = item.textAlign;
        textYPositionEl.value = item.textYPosition;
        textYPositionValueEl.textContent = `${item.textYPosition}%`;

        textGlowEl.checked = item.textGlow;
        glowOptionsEl.style.display = item.textGlow ? 'block' : 'none';
        glowColorEl.value = item.glowColor;
        glowBlurEl.value = item.glowBlur;
        glowBlurValueEl.textContent = item.glowBlur;

        textOutlineEl.checked = item.textOutline;
        outlineOptionsEl.style.display = item.textOutline ? 'block' : 'none';
        outlineColorEl.value = item.outlineColor;
        outlineWidthEl.value = item.outlineWidth;
        outlineWidthValueEl.textContent = item.outlineWidth;
        
        imageBrightnessEl.value = item.imageBrightness || 100;
        imageBrightnessValueEl.textContent = `${imageBrightnessEl.value}%`;

        bgTypeEl.value = item.bgType;
        if (item.bgType === 'image' && item.bgImageSrc) {
            bgColorGroupEl.style.display = 'none';
            bgImageGroupEl.style.display = 'block';
            currentBgImage = new Image();
            currentBgImage.onload = () => {
                 if (item.canvasWidth && item.canvasHeight) {
                    canvasEl.width = item.canvasWidth;
                    canvasEl.height = item.canvasHeight;
                    canvasWidthInput.value = item.canvasWidth;
                    canvasHeightInput.value = item.canvasHeight;
                }
                drawCanvas();
            };
            currentBgImage.src = item.bgImageSrc;
            bgImageEl.value = ''; // Clear file input
        } else {
            bgColorGroupEl.style.display = 'block';
            bgImageGroupEl.style.display = 'none';
            bgColorEl.value = item.bgColor;
            currentBgImage = null;
             if (item.canvasWidth && item.canvasHeight) {
                canvasEl.width = item.canvasWidth;
                canvasEl.height = item.canvasHeight;
                canvasWidthInput.value = item.canvasWidth;
                canvasHeightInput.value = item.canvasHeight;
            }
            drawCanvas();
        }
    }
    
    function deleteHistoryItem(index) {
        quoteHistory.splice(index, 1);
        localStorage.setItem('quoteHistory', JSON.stringify(quoteHistory));
        renderHistory();
    }

    toggleHistoryBtn.addEventListener('click', () => {
        const isHidden = quoteHistoryEl.style.display === 'none';
        quoteHistoryEl.style.display = isHidden ? 'grid' : 'none'; // Use grid for layout
        toggleHistoryBtn.textContent = isHidden ? 'Hide History' : 'Show History';
    });
    
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all saved history? This cannot be undone.")) {
            quoteHistory = [];
            localStorage.removeItem('quoteHistory');
            renderHistory();
        }
    });


    // --- Initial Render ---
    // Set default active alignment button
    document.querySelector(`.align-btn[data-align='${currentTextAlign}']`).classList.add('active');
    // Trigger initial display of conditional options
    glowOptionsEl.style.display = textGlowEl.checked ? 'block' : 'none';
    outlineOptionsEl.style.display = textOutlineEl.checked ? 'block' : 'none';
    if (bgTypeEl.value === 'color') {
        bgColorGroupEl.style.display = 'block';
        bgImageGroupEl.style.display = 'none';
    } else {
        bgColorGroupEl.style.display = 'none';
        bgImageGroupEl.style.display = 'block';
    }
    // Update slider values
    fontSizeValueEl.textContent = `${fontSizeEl.value}px`;
    glowBlurValueEl.textContent = glowBlurEl.value;
    outlineWidthValueEl.textContent = outlineWidthEl.value;
    textYPositionValueEl.textContent = `${textYPositionEl.value}%`;
    imageBrightnessValueEl.textContent = `${imageBrightnessEl.value}%`;

    drawCanvas(); // Initial draw
    renderHistory(); // Render history on load
});
