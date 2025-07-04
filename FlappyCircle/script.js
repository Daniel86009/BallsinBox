let c = document.getElementById('c');
let ctx = c.getContext('2d');
let scoreText = document.getElementById('score');

let player;
let pipes = [];
let clouds = [];

function start() {
    c.width = 500;
    c.height = 300;

    player = new Player(100, 200);

    //Pipes
    pipes.push(new Pipe(Math.random() * (230 - 70) + 70));
    setInterval(function() {
        pipes.push(new Pipe(Math.random() * (230 - 70) + 70));
    }, 2000);

    //Clouds
    clouds.push(new Cloud(Math.random() * (250 - 40) + 40));
    setInterval(function() {
        clouds.push(new Cloud(Math.random() * (250 - 40) + 40));
    }, 4200);

    window.addEventListener('click', function() {
        if (player.dead) {
            player.dead = false;
            pipes = [];
            player.score = 0;
            scoreText.innerHTML = player.score;
            update();
        } else {
            player.vel.y = -5;
        }
    });    
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    for (let i = 0; i < clouds.length; i++) {
        clouds[i].draw();
        clouds[i].update();
    }

    player.draw();
    player.update();

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].draw();
        pipes[i].update();
    }

    if (!player.dead) window.requestAnimationFrame(update);
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vel = {x: 0, y: 0};
        this.r = 15;

        this.dead = false;
        this.score = 0;

        this.canScore = true;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'Orange';
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    update() {
        this.vel.y += 0.2;
        this.x += this.vel.x;
        this.y += this.vel.y;

        if (this.y > c.height - this.r) {
            this.vel.y = 0;
            this.y = c.height - this.r;
        }

        this.pipeCol();
    }

    pipeCol() {
        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            
            if (this.x + this.r > p.x && this.x - this.r < p.x + 50) {
                if (this.y - this.r < p.y - p.gap) { //Top
                    this.dead = true;
                }
                
                if (this.y + this.r > p.y + p.gap) { //Bottom
                    this.dead = true;
                }
            }

            if (p.x < 60 && this.canScore) {
                this.score++;
                scoreText.innerHTML = this.score;
                this.canScore = false;
            }
        }
    }
}

class Pipe {
    constructor(y, gap = 60) {
        this.x = c.width;
        this.y = y;
        this.gap = gap;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, 0, 50, this.y - this.gap); //Top

        ctx.beginPath();
        ctx.fillRect(this.x, this.y + this.gap, 50, c.height - this.y + this.gap) //Bottom
    }

    update() {
        this.x -= 1.5;

        if (this.x < -50) {
            delete this.x;
            delete this.y;
            player.canScore = true;
        }
    }
}

class Cloud {
    constructor(y) {
        this.x = c.width + 40;
        this.y = y;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(this.x, this.y, 20, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(this.x, this.y + 8, 20, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(this.x + 20, this.y + 8, 20, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(this.x - 20, this.y + 8, 20, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        this.x -= 0.5;

        if (this.x < -40) {
            delete this.x;
            delete this.y;
        }
    }
}

start();
window.requestAnimationFrame(update);