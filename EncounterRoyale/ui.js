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
totalCrownDisplay.innerHTML = `${localStorage.crowns || 0} 👑`;

//Change card size on mobile
if (window.innerWidth < 800) {
    const cards = document.getElementsByClassName('card');
    const nextCard = document.getElementById('nextCard');
    const c = document.getElementById('c');

    for (let i = 0; i < cards.length; i++) {
        cards[i].style.width = '50px';
        cards[i].style.height = '62px';
        cards[i].style.fontSize = '7px';
    }

    nextCard.style.width = '25px';
    nextCard.style.height = '31px';
    nextCard.style.fontSize = '3.5px';
    nextCard.style.display = 'none';

    c.style.width = `${window.innerWidth - 10}px`;
    c.style.height = `${window.innerHeight - 120}px`;

    document.getElementById('elixirBarOuter').style.width = `${window.innerWidth - 10}px`;
    document.getElementById('playerUI').style.width = `${window.innerWidth - 10}px`;
    document.getElementById('chosenCards').style.width = '225px';
    document.getElementById('gameoverMessage').style.fontSize = '20px';
    document.getElementById('gameoverScreen').style.height = `${window.innerHeight}`;
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


const elixirMultSlider = document.getElementById('enemyElixirMult');
const elixirMultValue = document.getElementById('enemyElixirValue');

const debugDrawRange = document.getElementById('debugDrawRange');
const debugDrawViewRange = document.getElementById('debugDrawViewRange');

const infinitePlayerElixir = document.getElementById('infinitePlayerElixir');
const pickSameCards = document.getElementById('pickSameCards');

elixirMultSlider.value = game.enemyElixirMult;
debugDrawRange.checked = debug.drawRange;
debugDrawViewRange.checked = debug.drawViewRange;
infinitePlayerElixir.checked = game.playerElixirMult > 10;
pickSameCards.checked = debug.pickSameCards;

elixirMultSlider.addEventListener('input', () => {
    elixirMultValue.textContent = elixirMultSlider.value;
    game.enemyElixirMult = Number(elixirMultSlider.value);
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
        game.playerElixirMult = 999;
        game.playerStartElixir = 999;
    } else {
        playerElixir = 5;
        game.playerStartElixir = 5;
        game.playerElixirMult = 1;
    }
});

pickSameCards.addEventListener('change', e => {
    window.pickSameCards = e.target.checked;
    debug.pickSameCards = e.target.checked;
});


start();
window.requestAnimationFrame(update);