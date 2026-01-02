import {initializeApp} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {getDatabase, ref, set, increment, onValue} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDu59Lvbqa__hOz5CJlX7dsln-3TQEwQFw",
    authDomain: "ballsinbox.firebaseapp.com",
    databaseURL: "https://ballsinbox-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ballsinbox",
    storageBucket: "ballsinbox.firebasestorage.app",
    messagingSenderId: "173610270088",
    appId: "1:173610270088:web:4d802f7e1b72ed20524e3d",
    measurementId: "G-NKDXZH14L8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

const countRef = ref(db, 'viewcount');
onValue(countRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        
    }
});

function incrementViewCount(site) {
    switch (site) {
        case 'badPhysicsEngine':
            break;
        case 'ballsinbox':
            break;
        case 'button':
            break;
        case 'encounterRoyale':
            break;
        case 'fallingSand':
            break;
        case 'flappyCircle':
            break;
        case 'metaBalls':
            break;
    }
}