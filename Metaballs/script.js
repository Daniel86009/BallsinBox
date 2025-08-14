let c = document.getElementById('c');
let ctx = c.getContext('2d');
let style = window.getComputedStyle(document.body);

let grid = [];
let lines = [];
let particles = [];
let numPoints = 40;
let spacing;

let mouse = {x: 0, y: 0, down: false};

let drawPoints = false;

function start() {
    c.width = 400;
    c.height = 400;

    spacing = {x: c.width / numPoints, y: c.height / numPoints};

    document.addEventListener('mousedown', function() {
        mouse.down = true;
    });

    document.addEventListener('mouseup', function() {
        mouse.down = false;
    });

    document.addEventListener('mousemove', (e) => {
        let rect = c.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    for (let x = 0; x < numPoints; x++) {
        grid.push([]);
        for (let y = 0; y < numPoints; y++) {
            grid[x].push({x: x * c.width / numPoints + spacing.x / 2, y: y * c.height / numPoints + spacing.y / 2, a: 0});
        }
    }

    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(200, 200));
        particles[i].r = 10;
    }
    
    
    march();
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    input();

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }

    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            let sum = 0;
            let p = grid[x][y];
            for (let i = 0; i < particles.length; i++) {
                let pt = particles[i];
                let dx = p.x - pt.x;
                let dy = p.y - pt.y;
                let d2 = Math.sqrt(dx * dx + dy * dy);
                sum += 1 / d2 * pt.r;
            }
            p.a = sum;
            march();
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let l = lines[i];
        ctx.beginPath();
        ctx.strokeStyle = style.getPropertyValue('--text-color');
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
        ctx.stroke();
    }

    if (drawPoints) {
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                let p = grid[x][y];
                if (p.a > 0.5) {
                    ctx.beginPath();
                    ctx.fillStyle = 'red';
                    ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.fillStyle = 'black';
                    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
            }
        }
    }

    window.requestAnimationFrame(update);
}

function march() {
    lines = [];

    for (let x = 0; x < grid.length - 1; x++) {
        for (let y = 0; y < grid[x].length - 1; y++) {
            let a = grid[x][y];
            let b = grid[x+1][y];
            let c = grid[x][y+1];
            let d = grid[x+1][y+1];

            let s = {x: spacing.x / 2, y: spacing.y / 2};

            let num = 0;
            if (a.a > 0.5) num += 1;
            if (b.a > 0.5) num += 2;
            if (c.a > 0.5) num += 4;
            if (d.a > 0.5) num += 8;

            //-3-
            //0 2
            //-1-

            let p1, p2;
            switch (num) {
                case 0:
                    //00
                    //00
                    break;
                case 1:
                    //10
                    //00
                    p1 = interp(a, b);
                    p2 = interp(a, c);
                    lines.push({a: p1, b: p2});
                    break;
                case 2:
                    //01
                    //00
                    p1 = interp(a, b);
                    p2 = interp(b, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 3:
                    //11
                    //00
                    p1 = interp(a, c);
                    p2 = interp(b, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 4:
                    //00
                    //10
                    p1 = interp(a, c);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 5:
                    //10
                    //10
                    p1 = interp(a, b);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 6:
                    //01
                    //10

                    //01
                    //00
                    p1 = interp(a, b);
                    p2 = interp(b, d);
                    lines.push({a: p1, b: p2});

                    //00
                    //10
                    p1 = interp(a, c);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});

                    break;
                case 7:
                    //11
                    //10
                    p1 = interp(b, d);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 8:
                    //00
                    //01
                    p1 = interp(b, d);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 9:
                    //10
                    //01

                    //10
                    //00
                    p1 = interp(a, b);
                    p2 = interp(a, c);
                    lines.push({a: p1, b: p2});

                    //00
                    //01
                    p1 = interp(b, d);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});

                    break;
                case 10:
                    //01
                    //01
                    p1 = interp(a, b);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 11:
                    //11
                    //01
                    p1 = interp(a, c);
                    p2 = interp(c, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 12:
                    //00
                    //11
                    p1 = interp(a, c);
                    p2 = interp(b, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 13:
                    //10
                    //11
                    p1 = interp(a, b);
                    p2 = interp(b, d);
                    lines.push({a: p1, b: p2});
                    break;
                case 14:
                    //01
                    //11
                    p1 = interp(a, b);
                    p2 = interp(a, c);
                    lines.push({a: p1, b: p2});
                    break;
                case 15:
                    //11
                    //11
                    break;
            }
        }
    }
}

function interp(p1, p2, threshold = 0.5) {
    let t = (threshold - p1.a) / (p2.a - p1.a);

    return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
    };
}

function input() {
    for (let i = 0; i < 10; i++) {
        if (false) {
            let r = 20;
            let cellX = Math.floor((mouse.x + Math.random() * (r + r) - r) / (c.width / numPoints));
            let cellY = Math.floor((mouse.y + Math.random() * (r + r) - r) / (c.height / numPoints));
            if (grid[cellX][cellY].a <= 1) {
                grid[cellX][cellY].a += 0.1;
                march();
            } else {
                grid[cellX][cellY].a = 1;
                march();
            }
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vel = {x: Math.random() * (2 + 2) - 2, y: Math.random() * (2 + 2) - 2};
        this.r = 10;
    }

    update() {
        this.x += this.vel.x;
        this.y += this.vel.y;
        this.wallCol();
    }

    wallCol() {
        if (this.x > c.width) {
            this.x = c.width;
            this.vel.x *= -1;
        }
        if (this.x < 0) {
            this.x = 0;
            this.vel.x *= -1
        }

        if (this.y > c.height) {
            this.y = c.height;
            this.vel.y *= -1;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vel.y *= -1;
        }
    }
}

start();
window.requestAnimationFrame(update);