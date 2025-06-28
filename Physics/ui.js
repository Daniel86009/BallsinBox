let shapeSizeSlider = document.getElementById('shapeSizeSlider');

let isMobile = !window.matchMedia('(hover: hover)').matches;

function start() {
    shapeSizeSlider.addEventListener('change', function() {
        selectionSize = shapeSizeSlider.value;
    });


    if (isMobile) {
        let d = document.getElementById('description');
        let children = d.children;
        children[1].innerHTML = 'Tap on a shape to pick it up';
        children[2].innerHTML = 'Tap with two fingers to create a shape';
        children[3].innerHTML = 'Tap on "Shape" or "Display" to change settings';
        children[4].innerHTML = '';
        children[4].style.display = 'none';
    }
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