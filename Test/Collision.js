let c = document.getElementById('c');
let ctx = c.getContext('2d');

let shapes = [];

let pressedKeys = [];

let damping = 0.01;
let gravity = {x: 0, y: 0.4};
let iter = 5;

function start() {
    c.width = 400;
    c.height = 400;

    document.addEventListener('keydown', (event) => {
        let keyName = event.key;
        for (let i = 0; i < pressedKeys.length; i++) {
            if (pressedKeys[i] == keyName) {
                pressedKeys.splice(i, 1);
                i--;
            }
        }
        pressedKeys.push(keyName);
    });

    document.addEventListener('keyup', (event) => {
        let keyName = event.key;
        for (let i = 0; i < pressedKeys.length; i++) {
            if (pressedKeys[i] == keyName) {
                pressedKeys.splice(i, 1);
                i--;
            }
        }
    });

    shapes.push(new Shape([
        {x: 100, y: 100},
        {x: 100, y: 200},
        {x: 200, y: 200},
        {x: 200, y: 100}
    ]));

    shapes.push(new Shape([
        {x: 200, y: 200},
        {x: 200, y: 300},
        {x: 300, y: 300}
    ]));

    shapes.push(new Shape([
        {x: 20, y: 350},
        {x: 380, y: 350},
        {x: 380, y: 380},
        {x: 20, y: 380}
    ], true));

    shapes[0].mass = 2;
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    inputs();

    /*for (let i = 0; i < shapes.length; i++) {
        shapes[i].colour = 'rgba(220, 220, 220, 0.5)';
        shapes[i].update();
    }*/

    let delta = 1 / iter;

    for (let i = 0; i < iter; i++) {

        for (let i = 0; i < shapes.length; i++) {
            shapes[i].colour = 'rgba(220, 220, 220, 0.5)';
            shapes[i].update(delta);
        }

        let col1 = Collision.GJK(shapes[0], shapes[1]);
        let col2 = Collision.GJK(shapes[2], shapes[0]);
        let col3 = Collision.GJK(shapes[2], shapes[1]);

        if (col1 != 0) {
            shapes[0].colour = 'rgba(207, 44, 44, 0.5)';
            shapes[1].colour = 'rgba(207, 44, 44, 0.5)';
            shapes[1].collide(col1, shapes[0], delta);
        }
        if (col2 != 0) {
            shapes[0].colour = 'rgba(207, 44, 44, 0.5)';
            shapes[2].colour = 'rgba(207, 44, 44, 0.5)';
            shapes[0].collide(col2, shapes[2], delta);
        }
        if (col3 !=0) {
            shapes[1].colour = 'rgba(207, 44, 44, 0.5)';
            shapes[2].colour = 'rgba(207, 44, 44, 0.5)';
            shapes[1].collide(col3, shapes[2], delta);
        }
    }

    for (let i = 0; i < shapes.length; i++) {
        shapes[i].draw();
    }

    window.requestAnimationFrame(update);
}

function inputs() {
    let maxVel = 4;
    for (let i = 0; i < pressedKeys.length; i++) {
        switch (pressedKeys[i]) {
            case 'w':
                if (shapes[0].vel.y >= -maxVel) {
                    shapes[0].vel.y -= 1;
                } else {
                    shapes[0].vel.y = -maxVel;
                }
                break;
            case 'a':
                if (shapes[0].vel.x >= -maxVel) {
                    shapes[0].vel.x -= 0.1;
                } else {
                    shapes[0].vel.x = -maxVel;
                }
                break;
            case 's':
                if (shapes[0].vel.y <= maxVel) {
                    shapes[0].vel.y += 0.1;
                } else {
                    shapes[0].vel.y = maxVel;
                }
                break;
            case 'd':
                if (shapes[0].vel.x <= maxVel) {
                    shapes[0].vel.x += 0.1;
                } else {
                    shapes[0].vel.x = maxVel;
                }
                break;
            case 'q':
                shapes[0].rotate(-0.05);
                break;
            case 'e':
                shapes[0].rotate(0.05);
                break;


            case 'u':
                if (shapes[1].vel.y >= -maxVel) {
                    shapes[1].vel.y -= 1;
                } else {
                    shapes[1].vel.y = -maxVel;
                }
                break;
            case 'h':
                if (shapes[1].vel.x >= -maxVel) {
                    shapes[1].vel.x -= 0.1;
                } else {
                    shapes[1].vel.x = -maxVel;
                }
                break;
            case 'j':
                if (shapes[1].vel.y <= maxVel) {
                    shapes[1].vel.y += 0.1;
                } else {
                    shapes[1].vel.y = maxVel;
                }
                break;
            case 'k':
                if (shapes[1].vel.x <= maxVel) {
                    shapes[1].vel.x += 0.1;
                } else {
                    shapes[1].vel.x = maxVel;
                }
                break;
            case 'y':
                shapes[1].rotate(-0.05);
                break;
            case 'i':
                shapes[1].rotate(0.05);
                break;

            case 'r':
                shapes[0].translate(-shapes[0].vertices[0].x + 100, -shapes[0].vertices[0].y + 100);
                shapes[1].translate(-shapes[1].vertices[1].x + 200, -shapes[1].vertices[1].y + 200);
                shapes[0].vel = {x: 0, y: 0};
                shapes[1].vel = {x: 0, y: 0};
                break;
        }
    }
}

class Shape {
    constructor(vertices, isStatic = false) {
        this.vertices = vertices;

        this.centroid = M.calcCentroid(this.vertices);

        this.vel = {x: 0, y: 0};
        this.isStatic = isStatic;
        this.mass = 1;

        this.colour = 'rgba(220, 220, 220, 0.5)';
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 0; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(this.centroid.x, this.centroid.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    update(delta) {
        if (this.isStatic) return;
        
        //delta *= delta;

        this.vel.x += gravity.x * delta;
        this.vel.y += gravity.y * delta;
        this.vel.x *= 0.99;
        this.vel.y *= 0.99;

        this.translate(this.vel.x * delta, this.vel.y * delta);
    }

    collide(v, obj, delta) {
        let n = M.normalise({x: -v.x, y: -v.y});
        let rv = {x: obj.vel.x - this.vel.x, y: obj.vel.y - this.vel.y};
        let m = rv.x * n.x + rv.y * n.y;

        if (m > 0) return;

        let ima = 1 / this.mass;
        let imb = 1 / obj.mass;
        let j = -(1 + damping) * m / (ima + imb);
        let impulse = {x: j * n.x, y: j * n.y};

        if (!this.isStatic) {
            this.translate(v.x / 2, v.y / 2);
            this.vel.x -= impulse.x * ima * delta;
            this.vel.y -= impulse.y * ima * delta;
        }

        if (!obj.isStatic) {
            obj.translate(-v.x / 2, -v.y / 2);
            obj.vel.x += impulse.x * imb * delta;
            obj.vel.y += impulse.y * imb * delta;
        } else {
            this.translate(v.x / 2, v.y / 2);
        }
    }

    collideRot(v, obj) {
        let damping = 0.05;

        let n = M.normalise({x: -v.x, y: -v.y});
        let rv = {x: obj.vel.x - this.vel.x, y: obj.vel.y - this.vel.y};
        let m = rv.x * n.x + rv.y * n.y;

        if (m > 0) return;

        let ima = 1 / this.mass;
        let imb = 1 / obj.mass;
        let j = -(1 + damping) * m / (ima + imb);
        let impulse = {x: j * n.x, y: j * n.y};

        let refEdge = Collision.findRef(this.vertices, n);
        let iEdge = Collision.findIncident(obj.vertices, n);

        let refDir = {x: refEdge[0].x - refEdge[1].x, y: refEdge[0].y - refEdge[1].y};
        refDir = M.normalise(refDir);

        let edgeNorm = {x: -refDir.y, y: refDir.x};

        let off1 = M.dot(refDir, refEdge[1]);
        let off2 = -refDir.x * refEdge[0].x - refDir.y * refEdge[0];

        let clipped = Collision.clipPoints(iEdge, refDir, off1);
        clipped = Collision.clipPoints(clipped, {x: -refDir.x, y: -refDir.y}, -off2);

        let pOff = edgeNorm.x * refEdge[1].x + edgeNorm.y * refEdge[1].y;
        clipped = Collision.clipPoints(clipped, edgeNorm, pOff);

        /*ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(clipped[0].x, clipped[0].y, 5, 0, 2 * Math.PI);
        ctx.fill();*/
        console.log(clipped);

        if (!this.isStatic) {
            this.translate(v.x / 2, v.y / 2);
            this.vel.x -= impulse.x * ima;
            this.vel.y -= impulse.y * ima;
        }

        if (!obj.isStatic) {
            obj.translate(-v.x / 2, -v.y / 2);
            obj.vel.x += impulse.x * imb;
            obj.vel.y += impulse.y * imb;
        } else {
            this.translate(v.x / 2, v.y / 2);
        }
    }

    translate(x, y) {
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].x += x;
            this.vertices[i].y += y;
        }
        this.centroid.x += x;
        this.centroid.y += y; 
    }
    
    rotate(r) {
        for (let i = 0; i < this.vertices.length; i++) {
            let x = this.vertices[i].x;
            let y = this.vertices[i].y;
            let dx = x - this.centroid.x;
            let dy = y - this.centroid.y;
            let rx = dx * Math.cos(r) + dy * -Math.sin(r);
            let ry = dx * Math.sin(r) + dy * Math.cos(r);

            this.vertices[i].x = rx + this.centroid.x;
            this.vertices[i].y = ry + this.centroid.y;
        }
    }

    findFurthest(dir) {
        let maxPoint = null;
        let maxDist = -Infinity;
        for (let i = 0; i < this.vertices.length; i++) {
            let dist = M.dot(this.vertices[i], dir);
            if (dist > maxDist) {
                maxDist = dist;
                maxPoint = this.vertices[i];
            }
        }

        return maxPoint;
    }
}

class Collision {
    static support(a, b, dir) {
        let fa = a.findFurthest(dir);
        let fb = b.findFurthest({x: -dir.x, y: -dir.y});

        return {x: fa.x - fb.x, y: fa.y - fb.y, fa: fa, fb: fb};
    }

    static GJK(a, b) {
        let simplex = [];
        let dir = {x: 1, y: 0};
        let support = this.support(a, b, dir);
        let testIter = 0;

        simplex.unshift(support);

        dir = {x: -support.x, y: -support.y};

        while (true) {
            if (testIter++ > 50) {
                console.error('infinite loop');
                return null;
            }

            support = this.support(a, b, dir);

            if (M.dot(support, dir) <= 0) {
                return 0;
            }
            
            simplex.unshift(support);

            if (this.nextSimplex(simplex, dir)) {
                return this.EPA(a, b, simplex);
            }
        }
    }

    static nextSimplex(points, dir) {
        if (points.length == 2) return this.lineTest(points, dir);

        if (points.length == 3) return this.triangleTest(points, dir);

        return false;
    }

    static lineTest(points, dir) {
        let a = points[0];
        let b = points[1];

        let ab = {x: a.x - b.x, y: a.y - b.y};
        let ao = {x: -a.x, y: -a.y};

        let nDir = M.normal(ab, ao);

        dir.x = nDir.x;
        dir.y = nDir.y;

        return false;
    }

    static triangleTest(points, dir) {
        let a = points[0];
        let b = points[1];
        let c = points[2];

        let ab = {x: a.x - b.x, y: a.y - b.y};
        let ac = {x: a.x - c.x, y: a.y - c.y};
        let ao = {x: -a.x, y: -a.y};

        let perp = M.normal(ab, ac);
        if (M.dot(perp, ao) > 0) {
            points.splice(2, 1);
            dir.x = perp.x;
            dir.y = perp.y;

            return false;
        }

        let perp2 = M.normal(ac, ab);
        if (M.dot(perp2, ao) > 0) {
            points.splice(1, 1);
            dir.x = perp2.x;
            dir.y = perp2.y;

            return false;
        }

        return true;
    }

    static EPA(a, b, points) {
        let iter = 0;

        while (iter++ < 100) {
            let minDist = Infinity;
            let cEdge = {index: -1, normal: null, dist: 0};

            for (let i = 0; i < points.length; i++) {
                let j = (i+1) % points.length;
                let v1 = points[i];
                let v2 = points[j];

                let diff = {x: v2.x - v1.x, y: v2.y - v1.y};
                let normal = M.normalise({x: diff.y, y: -diff.x});
                let dist = M.dot(normal, v1);

                if (dist < minDist) {
                    minDist = dist;
                    cEdge = {index: j, normal, dist};
                }
            }

            let support = this.support(a, b, cEdge.normal);
            let sDist = M.dot(cEdge.normal, support);

            if (sDist - cEdge.dist > 0.00000005) {
                points.splice(cEdge.index, 0, support);
            } else {
                return {x: cEdge.normal.x * cEdge.dist + 0.00000005, y: cEdge.normal.y * cEdge.dist + 0.00000005};
            }
        }

        return {x: 0, y: 0};
    }
}

class M {
    static calcCentroid(vertices) {
        let sum = {x: 0, y: 0};
        for (let i = 0; i < vertices.length; i++) {
            sum.x += vertices[i].x;
            sum.y += vertices[i].y;
        }
        return ({x: sum.x / vertices.length, y: sum.y / vertices.length});
    }

    static dot(v1, v2) {
        //console.log(v2);
        return (v1.x * v2.x) + (v1.y * v2.y);
    }

    static normal(v1, v2) {
        let perp = {x: -v1.y, y: v1.x};
        let normal = this.dot(perp, {x: -v2.x, y: -v2.y}) > 0
            ? {x: -perp.x, y: -perp.y}
            : perp;
        
        return normal;
    }

    static normalise(v) {
        let mag = Math.sqrt(v.x * v.x + v.y * v.y);
        
        return {x: v.x * (1 / mag), y: v.y * (1 / mag)};
    }
}

start();
window.requestAnimationFrame(update);