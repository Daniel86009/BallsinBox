const c = document.getElementById('confetti');
const ctx = c.getContext('2d');

const g = 0.1;

const particles = [];

function start() {
    c.width = document.documentElement.clientWidth - 0.01;
    c.height = document.documentElement.clientHeight - 0.01;

    window.addEventListener("resize", function() {
        c.width = document.documentElement.clientWidth - 0.01;
        c.height = document.documentElement.clientHeight - 0.01;
    });

    for (let i = 0; i < 1000; i++) {
        particles.push(new Particle(Math.random() * c.width, 0));
    }
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
    }

    window.requestAnimationFrame(update);
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.v = {x: 0, y: 0};

        this.r = 10;
        this.c = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
    }

    draw() {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle = this.c;
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    update() {
        this.v.y += g;

        this.x += this.v.x;
        this.y += this.v.y;

        if (this.y > c.width) {
            this.x = Math.random() * c.width;
            this.y = -this.r - 10;
            this.v = {x: Math.random() * 6 - 3, y: Math.random() * 6 - 3};
        }
    }
}

start();
window.requestAnimationFrame(update);