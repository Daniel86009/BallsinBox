const shapeSizeSlider = document.getElementById('shapeSizeSlider');
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.isLight == undefined) localStorage.isLight = false;
let t = localStorage.isLight == 'true' ? true : false;
body.classList.toggle('light', t);
toggleButton.textContent = t ? 'Switch to Dark Mode' : 'Switch to Light Mode';

const isMobile = !window.matchMedia('(hover: hover)').matches;

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

toggleButton.addEventListener('click', () => {
    let b = localStorage.isLight == 'true' ? true : false;
    b = !b;
    localStorage.isLight = b;
    body.classList.toggle('light', b);
    toggleButton.textContent = b ? 'Switch to Dark Mode' : 'Switch to Light Mode';
});

start();