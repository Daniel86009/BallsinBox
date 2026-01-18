const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.isLight == undefined) localStorage.isLight = false;
let t = localStorage.isLight == 'true' ? true : false;
body.classList.toggle('light', t);
toggleButton.textContent = t ? 'Switch to Dark Mode' : 'Switch to Light Mode';

toggleButton.addEventListener('click', () => {
    let b = localStorage.isLight == 'true' ? true : false;
    b = !b;
    localStorage.isLight = b;
    body.classList.toggle('light', b);
    toggleButton.textContent = b ? 'Switch to Dark Mode' : 'Switch to Light Mode';
});

//Crown display
const totalCrownDisplay = document.getElementById('totalCrownDisplay');
const multiplayerMenu = document.getElementById('multiplayerMenu');
totalCrownDisplay.innerHTML = `${localStorage.crowns || 0} 👑`;

//Change card size on mobile
if (window.innerWidth < 800) {
    multiplayerMenu.style.transform = 'scale(0.6)';
    multiplayerMenu.style.transformOrigin = 'top left';
}

//Options Menu
function updateOptionsMenuVisibility() {
    const gameoverVisible = getComputedStyle(document.getElementById('gameoverScreen')).visibility === 'visible';
    document.getElementById('optionsMenu').style.display = gameoverVisible ? 'block' : 'none';
}

updateOptionsMenuVisibility();

const optionsMenu = document.getElementById('optionsMenu');
const optionsInner = document.getElementById('optionsMenuInner');

optionsMenu.addEventListener('click', (e) => {
    if (e.target.closest('#optionsMenuInner')) return;

    const isOpen = optionsInner.style.display === 'block';
    optionsInner.style.display = isOpen ? 'none' : 'block';

    e.stopPropagation();
});

function handleOutsideClick(e) {
    if (optionsInner.style.display !== 'block') return;

    if (e.target.closest('#optionsMenu')) return;

    optionsInner.style.display = 'none';
}

window.addEventListener('click', handleOutsideClick);

window.addEventListener('touchstart', handleOutsideClick);

//Options
const elixirMultSlider = document.getElementById('enemyElixirMult');
const elixirMultValue = document.getElementById('enemyElixirValue');

const debugShowFPS = document.getElementById('debugShowFPS');
const debugDrawRange = document.getElementById('debugDrawRange');
const debugDrawViewRange = document.getElementById('debugDrawViewRange');

const pickSameCards = document.getElementById('pickSameCards');

elixirMultSlider.value = game.p2ElixirMult;
debugShowFPS.checked = debug.showFPS;
debugDrawRange.checked = debug.drawRange;
debugDrawViewRange.checked = debug.drawViewRange;
infinitePlayerElixir.checked = game.p1ElixirMult > 10;
pickSameCards.checked = debug.pickSameCards;

elixirMultSlider.addEventListener('input', () => {
    elixirMultValue.textContent = elixirMultSlider.value;
    game.p2ElixirMult = Number(elixirMultSlider.value);
});

debugShowFPS.addEventListener('change', e => {
    window.debugShowFPS = e.target.checked;
    debug.showFPS = e.target.checked;
});

debugDrawRange.addEventListener('change', e => {
    window.debugDrawRange = e.target.checked;
    debug.drawRange = e.target.checked;
});

debugDrawViewRange.addEventListener('change', e => {
    window.debugDrawViewRange = e.target.checked;
    debug.drawViewRange = e.target.checked;
});

infinitePlayerElixir.addEventListener('change', e => {
    window.infinitePlayerElixir = e.target.checked;
    if (e.target.checked) {
        game.p1ElixirMult = 999;
        game.p1StartElixir = 999;
    } else {
        playerElixir = 5;
        game.p1StartElixir = 5;
        game.p1ElixirMult = 1;
    }
});

pickSameCards.addEventListener('change', e => {
    window.pickSameCards = e.target.checked;
    debug.pickSameCards = e.target.checked;
});

//Sort options
/*const sortOptions = document.getElementById('sortOptions');
const sortDropDown = document.getElementById('sortDropDown');

sortDropDown.addEventListener('change', e => {
    switch (sortDropDown.value) {
        case 'name':
            break;
        case 'elixir':
            break;
        case 'rarity':
            break;
    }
});*/

start();
window.requestAnimationFrame(update);