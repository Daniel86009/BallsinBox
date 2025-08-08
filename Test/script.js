const qCont = document.getElementById('questionCont');
const p1 = document.getElementById('p1');
const rCont = document.getElementById('rCont');

let answers = [];

function clickButton(btn) {
    let parent = btn.parentNode;
    let children = parent.children;

    for (let i of children) {
        i.classList.remove('selected');
    }

    btn.classList.add('selected');
}

function loadResults() {
    qCont.style.display = 'none';
    p1.classList.add('progressFull');
    rCont.style.maxHeight = '1000px';
}

function retakeTest() {
    qCont.style.display = 'inline';
    p1.classList.remove('progressFull');
    for (let i of qCont.children) {
        for (let j of i.children) {
            if (j.className = 'buttons') {
                for (let l of j.children) {
                    l.classList.remove('selected');
                }
            }
        }
    }

    rCont.style.maxHeight = '0';
}


function testReset() {
    p1.classList.remove('progressFull');
}