const chart = document.querySelector('.chart');
const tooltip = document.getElementById('tooltip');
let circle = null;
let tooltipArrow = null;
let isDragging = false;
let activeBar = null;

function createOrUpdateCircle(event) {
    if (!circle) {
        circle = document.createElement('div');
        circle.id = 'click-circle';
        document.body.appendChild(circle);
        
        tooltipArrow = document.createElement('div');
        tooltipArrow.id = 'tooltip-arrow';
        document.body.appendChild(tooltipArrow);
    }
    moveCircle(event.pageX, event.pageY);
    circle.style.display = 'block';
    tooltip.showPopover();
    tooltipArrow.style.display = 'block';
}

function moveCircle(x, y) {
    if (!activeBar || !circle) return;

    const barRect = activeBar.getBoundingClientRect();
    const circleRadius = circle.offsetWidth / 2;

    // Calculate the centered position
    let newX = x - circleRadius;
    let newY = y - circleRadius;

    // Constrain the circle's position within the active bar's boundaries
    const minX = barRect.left + window.scrollX;
    const maxX = barRect.right + window.scrollX - circle.offsetWidth;
    const minY = barRect.top + window.scrollY;
    const maxY = barRect.bottom + window.scrollY - circle.offsetHeight;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    circle.style.left = `${newX}px`;
    circle.style.top = `${newY}px`;
    
    // Update arrow position based on tooltip's position
    if (tooltipArrow) {
        requestAnimationFrame(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            const circleRect = circle.getBoundingClientRect();
            
            // Check if tooltip is on the left side of the circle
            if (tooltipRect.right < circleRect.left) {
                tooltipArrow.classList.add('flipped-left');
            } else {
                tooltipArrow.classList.remove('flipped-left');
            }
        });
    }
}

chart.addEventListener('mousedown', (event) => {
    if (event.target.classList.contains('bar')) {
        isDragging = true;
        activeBar = event.target;
        createOrUpdateCircle(event);
    } else {
        if (circle) {
            circle.style.display = 'none';
            tooltip.hidePopover();
            if (tooltipArrow) {
                tooltipArrow.style.display = 'none';
            }
        }
        activeBar = null;
    }
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        moveCircle(event.pageX, event.pageY);
        if (!tooltip.matches(':popover-open')) {
            tooltip.showPopover();
        }
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    // Keep tooltip visible after dragging stops
});

// Zoom control
const zoomSlider = document.getElementById('zoom-slider');
const zoomValue = document.getElementById('zoom-value');
const zoomMinus = document.getElementById('zoom-minus');
const zoomPlus = document.getElementById('zoom-plus');
const zoomReset = document.getElementById('zoom-reset');
let currentScale = 1;

function updateZoom(value) {
    const newScale = value / 100;
    chart.style.transform = `scale(${newScale})`;
    chart.style.transformOrigin = 'top left';
    zoomValue.textContent = `${value}%`;
    zoomSlider.value = value;
    
    // Position value above slider thumb
    updateValuePosition(value);
    
    // Update circle position if it exists and is visible
    if (circle && circle.style.display === 'block') {
        const circleLeft = parseFloat(circle.style.left);
        const circleTop = parseFloat(circle.style.top);
        
        // Calculate the position change based on scale difference
        const scaleDiff = newScale / currentScale;
        
        // Adjust position proportionally
        circle.style.left = `${circleLeft * scaleDiff}px`;
        circle.style.top = `${circleTop * scaleDiff}px`;
    }
    
    currentScale = newScale;
}

function updateValuePosition(value) {
    const min = parseFloat(zoomSlider.min);
    const max = parseFloat(zoomSlider.max);
    const percent = (value - min) / (max - min);
    const sliderWidth = zoomSlider.offsetWidth;
    const thumbWidth = 16; // Approximate thumb width
    // Calculate position accounting for thumb width so value is centered above thumb
    const position = percent * (sliderWidth - thumbWidth) + (thumbWidth / 2);
    zoomValue.style.left = `${position}px`;
}

zoomSlider.addEventListener('input', (event) => {
    updateZoom(event.target.value);
});

zoomMinus.addEventListener('click', () => {
    const newValue = Math.max(50, parseInt(zoomSlider.value) - 10);
    updateZoom(newValue);
});

zoomPlus.addEventListener('click', () => {
    const newValue = Math.min(200, parseInt(zoomSlider.value) + 10);
    updateZoom(newValue);
});

zoomReset.addEventListener('click', () => {
    updateZoom(100);
});

// Remove circle and tooltip on window resize
window.addEventListener('resize', () => {
    if (circle) {
        circle.style.display = 'none';
        tooltip.hidePopover();
        if (tooltipArrow) {
            tooltipArrow.style.display = 'none';
        }
    }
    activeBar = null;
    updateValuePosition(zoomSlider.value);
});

// Initialize value position on load
window.addEventListener('load', () => {
    updateValuePosition(100);
});

// Also initialize immediately
updateValuePosition(100);
