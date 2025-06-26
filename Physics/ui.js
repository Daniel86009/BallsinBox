let shapeSizeSlider = document.getElementById('shapeSizeSlider');

function start() {
    shapeSizeSlider.addEventListener('change', function() {
        selectionSize = shapeSizeSlider.value;
    });
}

function shapeButton(btn) {
    let parent = btn.parentNode;
    let children = parent.children;

    for (let i of children) {
        i.classList.remove('selected');
    }

    btn.classList.add('selected');
}

function displayButton(btn, d) {
    if (d) btn.classList.add('selected');
    else btn.classList.remove('selected');
}

start();