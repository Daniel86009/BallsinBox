let c = document.getElementById('c');
let ctx = c.getContext('2d');

let slider = document.getElementById('slider');

let grid = [];
let numCells = 100;

let elapsed = 0;
let now = Date.now()
let then = Date.now()
let fps = 60;

let mouse = {x: 0, y: 0, down: false, r: 20};
let selection = 'water';
let fillNum = 100;

function start() {
    c.width = 400;
    c.height = 400;

    for (x = 0; x < numCells; x++) {
        grid.push([]);
        for (y = 0; y < numCells; y++) {
            let type = '';
            let r = Math.random()
            if (r > 0.9) type = 'sand';
            grid[x].push({x: x * (c.width / numCells), y: y * (c.height / numCells), type: type, moved: false});
        }
    }

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

    slider.addEventListener('change', function() {
        mouse.r = slider.value;
    });

}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    now = Date.now()
    elapsed = now - then;
    if (elapsed > 1000 / fps) {
        then = now - (elapsed % (1000 / fps));

        input();

        for (let y = grid[0].length - 1; y >= 0; y--) {
            for (let x = 0; x < grid.length; x++) {
                let p = grid[x][y];
                
                if (p.type != '' && p.type != 'rock') {

                    if (grid[x][y+1] && grid[x][y+1].type == '' && !grid[x][y+1].moved) {
                        grid[x][y+1].type = p.type;
                        p.type = '';
                        grid[x][y+1].moved = true;
                        p.moved = true
                    } else if (grid[x][y+1] && grid[x+1] && grid[x+1][y+1].type == '' && !grid[x+1][y+1].moved) {
                        grid[x+1][y+1].type = p.type;
                        p.type = '';
                        grid[x+1][y+1].moved = true;
                        p.moved = true
                    } else if (grid[x][y+1] && grid[x-1] && grid[x-1][y+1].type == '' && !grid[x-1][y+1].moved) {
                        grid[x-1][y+1].type = p.type;
                        p.type = '';
                        grid[x-1][y+1].moved = true;
                        p.moved = true
                    }

                    else if (!p.moved && p.type == 'water') {
                        let opt = [1, -1];
                        let d = opt[Math.floor(Math.random() * opt.length)];
                        if (grid[x+d] && grid[x+d][y] && grid[x+d][y].type == '' && !grid[x+d][y].moved) {
                            grid[x+d][y].type = p.type;
                            p.type = '';
                            grid[x+d][y].moved = true;
                        } else if (grid[x-d] && grid[x-d][y] && grid[x-d][y].type == '' && !grid[x-d][y].moved) {
                            grid[x-d][y].type = p.type;
                            p.type = '';
                            grid[x-d][y].moved = true;
                        }
                    }
                }
            }
        }

        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                let p = grid[x][y];
                p.moved = false;
            }
        }
    }
    
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            let p = grid[x][y];
            switch (p.type) {
                case 'sand':
                    ctx.fillStyle = 'rgb(255, 255, 0)';
                    break;
                case 'dirt':
                    ctx.fillStyle = 'rgb(146, 85, 35)';
                    break;
                case 'water':
                    ctx.fillStyle = 'rgba(0, 94, 245, 0.7)';
                    break;
                case 'rock':
                    ctx.fillStyle = 'rgb(90, 90, 90)';
                    break;
                default:
                    ctx.fillStyle = 'rgb(180, 180, 180)';
                    break;
            }

            ctx.beginPath();
            ctx.fillRect(p.x, p.y, (c.width / numCells), (c.height / numCells));
        }
    }

    if (mouse.down) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(102, 255, 0, 0.61)';
        ctx.arc(mouse.x, mouse.y, mouse.r, 0, 2 * Math.PI);
        ctx.fill();
    }

    window.requestAnimationFrame(update);
}

function input() {
    if (mouse.down) {
        let r = mouse.r / 2;
        for (let i = 0; i < fillNum; i++) {
            if (mouse.r <= 1) {
            let cellX = Math.floor(mouse.x / (c.width / numCells));
            let cellY = Math.floor(mouse.y / (c.height / numCells));
            if (grid[cellX] && grid[cellX][cellY]) {
                let cell = grid[cellX][cellY];
                if (selection != 'rock') {
                    if (cell.type === '') cell.type = selection;
                } else {
                    cell.type = selection;
                }
                
            }
            } else {
                let cellX = Math.floor((mouse.x + Math.random() * (r + r) - r) / (c.width / numCells));
                let cellY = Math.floor((mouse.y + Math.random() * (r + r) - r) / (c.height / numCells));
                if (grid[cellX] && grid[cellX][cellY]) {
                    let cell = grid[cellX][cellY];
                    if (selection != 'rock') {
                    if (cell.type === '') cell.type = selection;
                    } else {
                        cell.type = selection;
                    }
                }
            }
        }
        
        
        
    }
}

function btn(value) {
    selection = value;
}

start();
window.requestAnimationFrame(update);