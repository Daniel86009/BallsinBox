const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
const cNumText = document.getElementById("cNum");
const gSlider = document.getElementById("gSlider");
const gText = document.getElementById("gravity");
const rSlider1 = document.getElementById("rSlider1");
const rSlider2 = document.getElementById("rSlider2");
const fSlider = document.getElementById('fSlider');
const minRText = document.getElementById("minR");
const maxRText = document.getElementById("maxR");
const wallFrictionText = document.getElementById('wallFriction');
const useQuadInput = document.getElementById("useQuad");
const drawQuadInput = document.getElementById("drawQuad");
const drawCheckRangeInput = document.getElementById("drawCheckRange");


const circles = [];
let cNum = 0;
const isMobile = !window.matchMedia('(hover: hover)').matches;
let useQuad = true;
let drawQuad = false;
let drawCheck = false;

let g = {x: 0, y: 0};
let gm = 0.2;
let wallFriction = 0.7;
let minRadius = 5;
let maxRadius = 20;

let mouse = {x: 0, y: 0, ox: 0, oy: 0, down: false};
let rot = {x: 0, y: 0, z: 0};



function setUp() {
    c.width = document.documentElement.clientWidth - 0.01;
    c.height = document.documentElement.clientHeight - 0.01;
    gSlider.value = gm;
    rSlider1.value = minRadius;
    rSlider2.value = maxRadius;
    useQuadInput.checked = useQuad;
    drawQuadInput.checked = drawQuad;
    drawCheckRangeInput.checked = drawCheck;

    if (isMobile) {
        document.getElementById('title').style.fontSize = '40px';
        document.getElementById('title').style.textWrap = 'nowrap';
    }

    window.addEventListener('deviceorientation', (e) => {
        const alpha = e.alpha;
        const beta = e.beta;
        const gamma = e.gamma;
        rot.x = alpha;
        rot.y = beta;
        rot.z = gamma;

        g = screenGravityFromEuler({xDeg: rot.x, yDeg: rot.y, zDeg: rot.z, g: gm, map: 'yIsPitchAboutX'});
        console.log(`alpha: ${alpha}, beta: ${beta}, gamma: ${gamma}`);
    });

    c.addEventListener("mousedown", function () {
        mouse.down = true;
    });
    c.addEventListener("mouseup", function () {
        mouse.down = false;
    });

    document.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    c.addEventListener('touchstart', (e) => {
        e.preventDefault();
        let rect = c.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.down = true;
    });

    c.addEventListener('touchend', function () {
        mouse.down = false;
        mouse.s = null;
        mouse.offset = {x: 0, y: 0};
    });

    document.addEventListener('touchmove', (e) => {
        let rect = c.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
    });

    window.addEventListener("resize", function () {
        c.width = document.documentElement.clientWidth - 0.01;
        c.height = document.documentElement.clientHeight - 0.01;
    });

    gSlider.addEventListener("input", function () {
        gm = gSlider.value;
        gText.innerHTML = gm;
    });

    useQuadInput.addEventListener("change", function () {
        useQuad = useQuadInput.checked;
        drawQuad = useQuadInput.checked;
        drawQuadInput.checked = useQuadInput.checked;
    });

    drawQuadInput.addEventListener("change", function () {
        drawQuad = drawQuadInput.checked;
    });

    drawCheckRangeInput.addEventListener("change", function () {
        drawCheck = drawCheckRangeInput.checked;
    });
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    let tree = new TreeNode(new Quad(0, 0, c.width, c.height), 0);
    if (useQuad) {
        for (let i = 0; i < circles.length; i++) tree.insert(circles[i]);
        if (drawQuad) tree.draw();
    }

    var steps = 8;
    var delta = 1 / steps;

    while (steps--) {
        for (var i = 0; i < circles.length; i++) {
            circles[i].update(delta, tree);
        }
    }

    for (var i = 0; i < circles.length; i++) {
        circles[i].wallCol();
        circles[i].wallCol();
        circles[i].draw();
    }

    if (mouse.down) {
        cNum++;
        cNumText.innerHTML = cNum;
        circles.push(new circleObj(mouse.x, mouse.y));
    }

    mouse.ox = mouse.x;
    mouse.oy = mouse.y;
    window.requestAnimationFrame(update);
}

class circleObj {
    constructor(x, y) {
        if (x == undefined) x = Math.random() * (c.width - 20) + 10;
        if (y == undefined) y = Math.random() * (c.width - 20) + 10;

        this.x = x;
        this.y = y;

        this.ox = x;
        this.oy = y;

        this.xa = 0;
        this.ya = 0;

        this.r = Math.random() * (maxRadius - minRadius) + minRadius;
        this.mass = this.r;

        this.colour = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
    }

    draw() {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.fillStyle = this.colour;
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    update(delta, tree) {
        delta *= delta;

        this.xa = g.x;
        this.ya = g.y;

        let xv = this.x - this.ox;
        let yv = this.y - this.oy;
        var nx = this.x * 2 - this.ox + this.xa * delta;
        var ny = this.y * 2 - this.oy + this.ya * delta;

        this.ox = this.x;
        this.oy = this.y;

        this.x = nx;
        this.y = ny;

        if (mouse.down == false) {
            this.mouseCol();
        }

        let checkPoints;
        if (useQuad) {
            let w = ((2 * this.r) + (4 * Math.max(xv, yv)));
            let checkRange = new Quad(this.x - w, this.y - w, w * 2, w * 2);
            if (drawCheck) checkRange.draw();
            checkPoints = tree.queryRange(checkRange);

            for (let i = 0; i < checkPoints.length; i++) {
                this.objectCol(checkPoints[i]);
            }
        }
        else {
            for (let i = 0; i < circles.length; i++) {
                this.objectCol(circles[i]);
            }
        }
    }

    wallCol() {
        var xv = this.x - this.ox;
        var yv = this.y - this.oy;
        //y collision
        if (this.y + this.r > c.height) {
            this.y = c.height - this.r;
            this.oy = this.y + yv * wallFriction;
        }
        if (this.y - this.r < 0) {
            this.y = 0 + this.r;
            this.oy = this.y + yv * wallFriction;
        }
        //x collision
        if (this.x + this.r > c.width) {
            this.x = c.width - this.r;
            this.ox = this.x + xv * wallFriction;
        }
        if (this.x - this.r < 0) {
            this.x = 0 + this.r;
            this.ox = this.x + xv * wallFriction;
        }
    }

    objectCol(obj) {
        if (obj == this) return;

        var minDist = obj.r + this.r;
        var dx = this.x - obj.x;
        var dy = this.y - obj.y;
        var d2 = dx * dx + dy * dy;

        //angle of line between two circles
        var a = Math.atan2(dy, dx);

        //check for collision
        if (d2 < minDist * minDist && d2 != 0) {
            var xv1 = this.x - this.ox;
            var yv1 = this.y - this.oy;
            var xv2 = obj.x - obj.ox;
            var yv2 = obj.y - obj.oy;

            var p1 = 0.8 * (dx * xv1 + dy * yv1) / d2;
            var p2 = 0.8 * (dx * xv2 + dy * yv2) / d2;
            var m1 = (2 * obj.mass) / (this.mass + obj.mass) * dot((xv1 - xv2), (yv1 - yv2), dx, dy) / (dx * 2, dy * 2) * (dx - dy);

            //update position
            var o = minDist - Math.sqrt(d2);
            var c = 0.5;

            var sepX = (dx / Math.sqrt(d2)) * o * c;
            var sepY = (dy / Math.sqrt(d2)) * o * c;

            this.x += sepX / 2;
            this.y += sepY / 2;
            obj.x -= sepX / 2;
            obj.y -= sepY / 2;

            //update velocity
            xv1 += p2 * dx - p1 * dx;
            xv2 += p1 * dx - p2 * dx;
            yv1 += p2 * dy - p1 * dy;
            yv2 += p1 * dy - p1 * dy;

            this.ox = this.x - xv1;
            this.oy = this.y - yv1;
            obj.ox = obj.x - xv2;
            obj.oy = obj.y - yv2;

        }
    }

    mouseCol() {
        var minDist = 50 + this.r;
        var dx = mouse.x - this.x;
        var dy = mouse.y - this.y;
        var d2 = dx * dx + dy * dy;

        //angle of line between two circles
        var a = Math.atan2(dy, dx);

        //check for collision
        if (d2 < minDist * minDist && d2 != 0) {
            var xv1 = this.x - this.ox;
            var yv1 = this.y - this.oy;
            var xvm = mouse.x - mouse.ox;
            var yvm = mouse.y - mouse.oy;

            var p1 = 0.8 * (dx * xv1 + dy * yv1) / d2;
            var p2 = 0.1 * (dx * xvm + dy * yvm) / d2;

            //update position
            var o = minDist - Math.sqrt(d2);
            var c = 0.5;

            var sepX = (dx / Math.sqrt(d2)) * o * c;
            var sepY = (dy / Math.sqrt(d2)) * o * c;

            this.x -= sepX / 2;
            this.y -= sepY / 2;

            //update velocity
            xv1 += p2 * dx - p1 * dx;
            yv1 += p2 * dy - p1 * dy;

            this.ox = this.x - xv1;
            this.oy = this.y - yv1;
        }
    }
}

class Quad {
    constructor(x, y, w, h) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + w;
        this.y2 = y + h;
        this.w = w;
        this.h = h;
    }

    contains(p) {
        if (this.x1 > p.x + p.r || this.x2 < p.x - p.r) return false;
        if (this.y1 > p.y + p.r || this.y2 < p.y - p.r) return false;

        return true;
    }

    intersects(b) {
        if (this.x1 > b.x2 || b.x1 > this.x2) return false;
        if (this.y1 > b.y2 || b.y1 > this.y2) return false;
        return true;
    }

    draw() {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.strokeRect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
        ctx.stroke();
    }
}

class TreeNode {
    constructor(area, depth) {
        this.area = area;
        this.points = [];
        this.isLeaf = true;
        this.depth = depth;
    }

    insert(p) {
        if (!this.area.contains(p)) return false;

        if (this.points.length < 4 && this.isLeaf) {
            this.points.push(p);
            return true;
        }

        if (this.depth > 8) return true;
        if (this.isLeaf) this.subdivide();
        if (this.tl.insert(p)) return true;
        if (this.tr.insert(p)) return true;
        if (this.bl.insert(p)) return true;
        if (this.br.insert(p)) return true;

        return false;
    }

    subdivide() {
        let mx = (this.area.x2 - this.area.x1) / 2;
        let my = (this.area.y2 - this.area.y1) / 2;

        this.tl = new TreeNode(new Quad(this.area.x1, this.area.y1, mx, my), this.depth + 1);
        this.tr = new TreeNode(new Quad(this.area.x1 + mx, this.area.y1, mx, my), this.depth + 1);
        this.bl = new TreeNode(new Quad(this.area.x1, this.area.y1 + my, mx, my), this.depth + 1);
        this.br = new TreeNode(new Quad(this.area.x1 + mx, this.area.y1 + my, mx, my), this.depth + 1);

        this.isLeaf = false;
        for (let i = 0; i < this.points.length; i++) this.insert(this.points[i]);
        this.points = [];
    }

    queryRange(area) {
        let pointsInRange = [];

        if (!this.area.intersects(area)) return pointsInRange;

        for (let i = 0; i < this.points.length; i++) {
            if (area.contains(this.points[i])) pointsInRange.push(this.points[i]);
        }

        if (this.isLeaf) return pointsInRange;

        pointsInRange = pointsInRange.concat(this.tl.queryRange(area));
        pointsInRange = pointsInRange.concat(this.tr.queryRange(area));
        pointsInRange = pointsInRange.concat(this.bl.queryRange(area));
        pointsInRange = pointsInRange.concat(this.br.queryRange(area));

        return pointsInRange;
    }

    draw() {
        if (this.isLeaf) this.area.draw();
        else {
            this.tl.draw();
            this.tr.draw();
            this.bl.draw();
            this.br.draw();
        }
        //this.area.draw();
        //this.tl?.draw();
        //this.tr?.draw();
        //this.bl?.draw();
        //this.br?.draw();
    }
}

function dot(x1, y1, x2, y2) {
    return (x1 * x2) + (y1 * y2);
}

function screenGravityFromEuler({xDeg, yDeg, zDeg, g = gm, map = "standard"}) {
    const d2r = d => d * Math.PI / 180;
    const Rx = a => {
        const c = Math.cos(a), s = Math.sin(a);
        return [
            [1, 0, 0],
            [0, c, -s],
            [0, s, c]
        ];
    };
    const Ry = a => {
        const c = Math.cos(a), s = Math.sin(a);
        return [
            [c, 0, s],
            [0, 1, 0],
            [-s, 0, c]
        ];
    };
    const Rz = a => {
        const c = Math.cos(a), s = Math.sin(a);
        return [
            [c, -s, 0],
            [s, c, 0],
            [0, 0, 1]
        ];
    };


    let ax = xDeg, ay = yDeg, az = zDeg;
    let buildR = (ax, ay, az) => multiply3(Rz(d2r(az)), multiply3(Ry(d2r(ay)), Rx(d2r(ax))));

    if (map === "yIsPitchAboutX") {
        ax = yDeg;
        ay = xDeg;
        az = zDeg;
    }

    const R = buildR(ax, ay, az);
    const gWorld = [0, 0, -g];
    const Rt = transpose3(R);
    const gDev = mulMatVec3(Rt, gWorld);

    const gx = gDev[0];
    const gy = gDev[1];

    return {x: gy, y: -gx};
}
function multiply3(A, B) {
    const C = Array(3).fill(0).map(() => Array(3).fill(0));
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            for (let k = 0; k < 3; k++)
                C[i][j] += A[i][k] * B[k][j];
    return C;
}
function transpose3(M) {
    return [
        [M[0][0], M[1][0], M[2][0]],
        [M[0][1], M[1][1], M[2][1]],
        [M[0][2], M[1][2], M[2][2]],
    ];
}
function mulMatVec3(M, v) {
    return [
        M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
        M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
        M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
    ];
}

function rSlide1() {
    if (rSlider2.value - rSlider1.value <= 0) {
        rSlider1.value = rSlider2.value;
    }
    minRadius = parseInt(rSlider1.value);
    minRText.innerHTML = parseInt(rSlider1.value);
}

function rSlide2() {
    if (rSlider2.value - rSlider1.value <= 0) {
        rSlider2.value = rSlider1.value;
    }
    maxRadius = parseInt(rSlider2.value);
    maxRText.innerHTML = parseInt(rSlider2.value);
}

function fSlide() {
    wallFriction = fSlider.value;
    wallFrictionText.innerHTML = fSlider.value;
}

setUp();
window.requestAnimationFrame(update);