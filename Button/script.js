const funSites = [
  "https://pointerpointer.com",
  "https://hackertyper.com",
  "https://longdogechallenge.com",
  "https://alwaysjudgeabookbyitscover.com",
  "https://cat-bounce.com",
  "https://zoomquilt.org",
  "https://weirdorconfusing.com",
  "https://omfgdogs.com",
  "https://fallingfalling.com",
  "https://www.koalastothemax.com",
  "https://cant-not-tweet-this.com",
  "https://thatsthefinger.com",
  "https://iamawesome.com",
  "https://isitchristmas.com",
  "https://ismycomputeron.com",
  "https://howbigismypotato.com",
  "https://thisissand.com",
  "https://ncase.me/trust",
  "https://tane.us",
  "https://superbad.com",
  "https://trypap.com",
  "https://thezen.zone",
  "https://checkboxrace.com",
  "https://windows93.net",
  "https://puginarug.com",
  "https://doge2048.com",
  "https://mondrianandme.com",
  "https://paintwithdonaldtrump.com",
  "https://userinyerface.com",
  "https://smashthewalls.com",
  "https://pannellum.org",
  "https://cantunsee.space",
  "https://www.rainymood.com",
  "https://thispersondoesnotexist.com",
  "https://thisrentaldoesnotexist.com",
  "https://findtheinvisiblecow.com",
  "https://paperplanes.world",
  "https://zoomquilt2.com",
  "https://patatap.com",
  "https://musiclab.chromeexperiments.com",
  "https://just-shower-thoughts.xyz",
  "https://mondrianandme.com",
  "https://paint.toys/one-line",
  "https://weavesilk.com",
  "https://binarypiano.com",
  "https://ncase.me/sight-and-light",
  "https://ncase.me/door",
  "https://zzzscore.com/color",
  "https://zzzscore.com/1to50",
  "https://rrrgggbbb.com",
  "https://hmpg.net/",
  "https://maze.toys/mazes/mini/daily/",
  "https://sliding.toys/mystic-square/8-puzzle/daily/",
  "https://paint.toys/calligram/",
  "https://memory.toys/classic/easy/",
  "https://clicking.toys/flip-grid/neat-nine/3-holes/"
];

const iframe = document.getElementById('website');
const urlDisplay = document.getElementById('urlDisplay');

let site = 50;

function itterSite() {
    iframe.src = funSites[site];
    site++;
}

function randomSite() {
    let randomSite = funSites[Math.floor(Math.random() * funSites.length)];
    iframe.src = randomSite;
    urlDisplay.innerHTML = randomSite;
}