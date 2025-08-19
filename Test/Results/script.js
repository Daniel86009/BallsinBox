const p1 = document.getElementById('p1');
const rCont = document.getElementById('rCont');

let answers = [];

function loadResults() {
    p1.classList.add('progressFull');
    rCont.style.maxHeight = '1000px';
}

function retakeTest() {
    p1.classList.remove('progressFull');
    rCont.style.maxHeight = '0';
}

function testReset() {
    p1.classList.remove('progressFull');
}