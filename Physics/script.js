let c = document.getElementById('c');
let ctx = c.getContext('2d');

let shapes = [];

let pressedKeys = [];
let mouse = {x: 0, y: 0, down: false, s: null, offset: {x: 0, y: 0}};
let selection = 'triangle';
let selectionSize = 70;

let draw = {bounds: false, centroid: false, outline: false, fill: true};

let damping = 0.01;
let iter = 100;

function start() {
    c.width = 400;
    c.height = 400;

    selectionSize = shapeSizeSlider.value;

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

    document.addEventListener('mousemove', (event) => {
        let rect = c.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    document.addEventListener('mousedown', (event) => {
        if (event.which == 1) {
            mouse.down = true;
        }
    });

    document.addEventListener('mouseup', (event) => {
        if (event.which == 1) {
            mouse.down = false;
            mouse.s = null;
            mouse.offset = {x: 0, y: 0};
        }
    });

    c.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            let rect = c.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            createShape(selection);
        } else {
            e.preventDefault();
            let rect = c.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.down = true;
        }
    });

    c.addEventListener('touchend', function() {
        mouse.down = false;
        mouse.s = null;
        mouse.offset = {x: 0, y: 0};
    });

    document.addEventListener('touchmove', (e) => {
        let rect = c.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
    });

    c.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (event.which == 3) {
            createShape(selection);
        }
    });

    resetShapes();
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    inputs();

    let delta = 1 / iter;

    for (let i = 0; i < iter; i++) {
        for (let j = 0; j < shapes.length; j++) {
            shapes[j].colour = 'rgba(220, 220, 220, 0.5)';
            shapes[j].update(delta);
            shapes[j].createBoundingBox();
        }

        for (let j = 0; j < shapes.length; j++) {
            let s1 = shapes[j];

            for (let l = 0; l < shapes.length; l++) {
                let s2 = shapes[l];

                if (s1 == s2) continue;
                if (s1.isStatic && s2.isStatic) continue;

                if (!Collision.AABB(s1.bounds, s2.bounds)) continue;

                let col = Collision.GJK(s1, s2);

                if (col != 0) {
                    s1.colour = 'rgba(207, 44, 44, 0.5)';
                    s2.colour = 'rgba(207, 44, 44, 0.5)';
                    let cont = Collision.findContacts(s1, s2);
                    s2.collideRot(col, s1, cont, delta);
                    s2.collide(col, s1, delta);
                }
            }
        }
    }

    if (mouse.down) {
        if (mouse.s && !mouse.s.isStatic) mouse.s.colour = 'rgba(123, 123, 219, 0.5)';
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
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
            case 'q':
                if (mouse.s) {
                    if (mouse.s.isStatic) mouse.s.rotate(-0.05);
                    else mouse.s.aVel -= 0.01;
                }
                break;
            case 'e':
                if (mouse.s) {
                    if (mouse.s.isStatic) mouse.s.rotate(0.05);
                    else mouse.s.aVel += 0.01;
                }
                break;

            case 'r':
                resetShapes();
                break;
            
            case 'z':
                //Debug Key
                console.log('');
        }
    }

    if (mouse.down) {
        let shape = mouse.s;

        if (!mouse.s) {
            for (let i = 0; i < shapes.length; i++) {
                let col = Collision.GJK(mouse, shapes[i]);
                if (col != 0) {
                    shape = shapes[i];
                    mouse.s = shapes[i];
                    mouse.offset = {x: mouse.x - shape.centroid.x, y: mouse.y - shape.centroid.y};
                }
            }
        }

        if (shape) {
            let dx = mouse.x - shape.centroid.x;
            let dy = mouse.y - shape.centroid.y;
            if (!shape.isStatic) {
                shape.vel.x = dx //- mouse.offset.x * 1; // shape.mass;
                shape.vel.y = dy //- mouse.offset.x * 1; // shape.mass;
            } else {
                shape.translate(dx - mouse.offset.x, dy - mouse.offset.y);
            }
        }
    }
}

function resetShapes() {
    shapes = [];
    //--------------Bodies--------------
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

    for (let i = 0; i < 1; i++) {
        shapes.push(new Shape([
        {x: 200, y: 200},
        {x: 200, y: 240},
        {x: 240, y: 240}
        ]));
        shapes[i+1].density = 0.01
    }

    //--------------Walls--------------
    shapes.push(new Shape([
        {x: 20, y: 350},
        {x: 380, y: 350},
        {x: 380, y: 380},
        {x: 20, y: 380}
    ], true));

    shapes.push(new Shape([
        {x: 0, y: 380},
        {x: 20, y: 380},
        {x: 20, y: 20},
        {x: 0, y: 20}
    ], true));

    shapes.push(new Shape([
        {x: 400, y: 380},
        {x: 380, y: 380},
        {x: 380, y: 20},
        {x: 400, y: 20}
    ], true));

    shapes[1].density = 0.2;
    shapes[1].mass = shapes[1].area * shapes[1].density;
    shapes[0].density = 0.8;
    shapes[0].mass = shapes[0].area * shapes[0].density;
}

function createShape(type) {
    let numPoints = 3;
    let points = [];
    let angle = 0;
    let startAngle = 0;

    switch (type) {
        case 'triangle':
            shapes.push(new Shape([
                {x: 0, y: 0},
                {x: 0, y: selectionSize / 1},
                {x: selectionSize / 1, y: selectionSize / 1}
            ]));
            shapes[shapes.length - 1].translate(mouse.x, mouse.y);
            break;

        case 'square':
            numPoints = 4
            angle = Math.PI * 2 / numPoints;
            startAngle = Math.PI / 4;

            for (let i = 0; i < numPoints; i++) {
                points.push({x: Math.cos(angle * i + startAngle) * selectionSize, y: Math.sin(angle * i + startAngle) * selectionSize});
            }

            shapes.push(new Shape(points));
            shapes[shapes.length - 1].translate(mouse.x, mouse.y);
            break;

        case 'polygon':
            let angles = [];
            //let radius = Math.random() * (70 - 40) + 40;
            numPoints = Math.random() * (8 - 3) + 3;

            for (let i = 0; i < 5; i++) {
                angles.push(Math.random() * Math.PI * 2);
            }

            angles.sort();

            for (let i = 0; i < angles.length; i++) {
                points.push({x: Math.cos(angles[i]) * selectionSize, y: Math.sin(angles[i]) * selectionSize});
            }

            shapes.push(new Shape(points));
            shapes[shapes.length - 1].translate(mouse.x, mouse.y);
            break;
    }
}

class Shape {
    constructor(vertices, isStatic = false) {
        this.vertices = vertices;

        this.centroid = M.calcCentroid(this.vertices);
        this.rotation = 0;
        this.bounds = null;

        this.vel = {x: 0, y: 0};
        this.aVel = 0;
        this.isStatic = isStatic;
        this.impulses = [{x: 0, y: 0}, {x: 0, y: 0}];
        this.raList = [{x: 0, y: 0}, {x: 0, y: 0}];
        this.rbList = [{x: 0, y: 0}, {x: 0, y: 0}];
        this.area = this.calcArea();
        this.density = 0.1;
        this.mass = this.density * this.area;
        this.inertia = this.calcMomentInertia() / 100000000000000000;
        this.restitution = 0.01;

        this.colour = 'rgba(220, 220, 220, 0.5)';
    }

    draw() {
        
        ctx.beginPath();
        ctx.fillStyle = this.colour;
        ctx.lineWidth = 3;
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 0; i < this.vertices.length + 1; i++) {
            ctx.lineTo(this.vertices[i % this.vertices.length].x, this.vertices[i % this.vertices.length].y);
        }
        if (draw.fill) ctx.fill();
        if (draw.outline) ctx.stroke();
        
        if (draw.centroid) {
            /*ctx.beginPath();
            ctx.fillStyle = 'red';
            ctx.lineWidth = 3;
            ctx.arc(this.centroid.x, this.centroid.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();*/
            let crossWidth = 5;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(this.centroid.x + crossWidth, this.centroid.y);
            ctx.lineTo(this.centroid.x - crossWidth, this.centroid.y);
            ctx.moveTo(this.centroid.x, this.centroid.y + crossWidth);
            ctx.lineTo(this.centroid.x, this.centroid.y - crossWidth);
            ctx.stroke();
        }
        
        if (draw.bounds) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        }
    }

    update(delta) {
        if (this.isStatic) return;
        
        this.vel.y += 0.2 * delta;
        /*this.vel.x *= 0.999;
        this.vel.y *= 0.999;
        this.aVel *= 0.999;*/

        this.rotate(this.aVel * delta);
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
        }
    }

    collideRot(v, obj, contacts, delta) {
    const n = M.normalise({ x: -v.x, y: -v.y });

    this.impulses = [];
    this.raList = [];
    this.rbList = [];

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];

        const ra = M.sub(contact, this.centroid);
        const rb = M.sub(contact, obj.centroid);

        this.raList[i] = ra;
        this.rbList[i] = rb;

        const raPerp = { x: -ra.y, y: ra.x };
        const rbPerp = { x: -rb.y, y: rb.x };

        const angularVelA = M.mult(raPerp, this.aVel);
        const angularVelB = M.mult(rbPerp, obj.aVel);

        const velA = M.add(this.vel, angularVelA);
        const velB = M.add(obj.vel, angularVelB);

        const relativeVelocity = M.sub(velB, velA);
        const contactVel = M.dot(relativeVelocity, n);

        if (contactVel > 0) continue;

        const raCrossN = M.dot(raPerp, n);
        const rbCrossN = M.dot(rbPerp, n);

        const invMassA = 1 / this.mass;
        const invMassB = 1 / obj.mass;
        const invInertiaA = 1 / this.inertia;
        const invInertiaB = 1 / obj.inertia;

        let denom = invMassA + invMassB
                  + (raCrossN * raCrossN) * invInertiaA
                  + (rbCrossN * rbCrossN) * invInertiaB;

        let j = -(1 + this.restitution) * contactVel / denom;
        j /= contacts.length;

        const impulse = M.mult(n, j);
        this.impulses[i] = impulse;
    }

    for (let i = 0; i < this.impulses.length; i++) {
        const impulse = this.impulses[i];
        if (!impulse) continue;

        const ra = this.raList[i];
        const rb = this.rbList[i];

        if (!this.isStatic) {
            this.vel = M.sub(this.vel, M.mult(impulse, delta / this.mass));
            this.aVel -= M.cross(ra, impulse) * delta / this.inertia;
        }
        
        if (!obj.isStatic) {
            obj.vel = M.add(obj.vel, M.mult(impulse, delta / obj.mass));
            obj.aVel += M.cross(rb, impulse) * delta / obj.inertia;
        }
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
    
    rotate(r, p) {
        if (p == undefined) p = this.centroid;

        for (let i = 0; i < this.vertices.length; i++) {
            let x = this.vertices[i].x;
            let y = this.vertices[i].y;
            let dx = x - p.x;
            let dy = y - p.y;
            let rx = dx * Math.cos(r) + dy * -Math.sin(r);
            let ry = dx * Math.sin(r) + dy * Math.cos(r);

            this.vertices[i].x = rx + p.x;
            this.vertices[i].y = ry + p.y;
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

    calcArea() {
        let area = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            let p1 = this.vertices[0];
            let p2 = this.vertices[i];
            let p3 = this.vertices[i+1];
            let v1 = {x: p3.x - p1.x, y: p3.y - p1.y};
            let v2 = {x: p2.x - p1.x, y: p2.y - p1.y};
            area += M.cross(v1, v2) / 2;
        }

        return Math.abs(area);
    }

    calcMomentInertia() {
        let inertia = 0;
        let area = 0;

        for (let i = 0; i < this.vertices.length; i++) {
            let p0 = this.vertices[i];
            let p1 = this.vertices[(i + 1) % this.vertices.length];

            let cross = M.cross(p0, p1);
            area += cross;
            inertia += cross * (p0.x * p0.x + p0.x * p1.x + p1.x * p1.x + p0.y * p0.y + p0.y * p1.y + p1.y * p1.y);
        }

        area *= 0.5;
        inertia *= (this.density / 12);

        return Math.abs(inertia);
    }

    createBoundingBox() {
        let x1, y1, x2, y2;

        x1 = this.findFurthest({x: -1, y: 0}).x;
        y1 = this.findFurthest({x: 0, y: -1}).y;
        x2 = this.findFurthest({x: 1, y: 0}).x;
        y2 = this.findFurthest({x: 0, y: 1}).y;

        this.bounds = {x: x1, y: y1, w: x2 - x1, h: y2 - y1};
    }
}

class Collision {
    static support(a, b, dir) {
        let fa = a.findFurthest(dir);
        let fb = b.findFurthest({x: -dir.x, y: -dir.y});
        if (fa == null) fa = {x: a.x, y: a.y};
        if (fb == null) fb = {x: b.x, y: b.y};

        return {x: fa.x - fb.x, y: fa.y - fb.y, fa: fa, fb: fb};
    }

    static GJK(a, b) {
        if (!a.vertices) a = new Shape([{x: a.x, y: a.y}]);
        if (!b.vertices) b = new Shape([{x: b.x, y: b.y}]);
        
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

        let mag = Math.sqrt(ab.x * ab.x + ab.y * ab.y);

        if (mag < 0.0001) {
            dir.x = -ao.x;
            dir.y = -ao.y;
            return false;
        }

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

        while (iter++ < 10000) {
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

            if (sDist - cEdge.dist > 0.005) {
                points.splice(cEdge.index, 0, support);
            } else {
                return {x: cEdge.normal.x * cEdge.dist + 0.000005, y: cEdge.normal.y * cEdge.dist + 0.000005};
            }
        }

        return {x: 0, y: 0};
    }

    static findContacts(a, b) {
        let contacts = [];
        let minDist = Infinity;

        for (let i = 0; i < a.vertices.length; i++) {
            let p = a.vertices[i];

            for (let j = 0; j < b.vertices.length; j++) {
                let va = b.vertices[j];
                let vb = b.vertices[(j+1) % b.vertices.length];

                let pd = this.pointSegmentDist(p, va, vb);

                if (M.nearEqual(pd.d2, minDist)) {
                    if (!M.nearEqual(pd.cp, contacts[0])) contacts[1] = pd.cp;
                } else if (pd.d2 < minDist) {
                    minDist = pd.d2;
                    contacts[0] = pd.cp;
                }
            }
        }

        for (let i = 0; i < b.vertices.length; i++) {
            let p = b.vertices[i];

            for (let j = 0; j < a.vertices.length; j++) {
                let va = a.vertices[j];
                let vb = a.vertices[(j+1) % a.vertices.length];

                let pd = this.pointSegmentDist(p, va, vb);

                if (M.nearEqual(pd.d2, minDist)) {
                    if (!M.nearEqual(pd.cp, contacts[0])) contacts[1] = pd.cp;
                } else if (pd.d2 < minDist) {
                    minDist = pd.d2;
                    contacts[0] = pd.cp;
                }
            }
        }

        return contacts;
    }

    static pointSegmentDist(p, a, b) {
        let ab = {x: b.x - a.x, y: b.y - a.y};
        let ap = {x: p.x - a.x, y: p.y - a.y};
        let cp = null;

        let proj = M.dot(ap, ab);
        let l = ab.x * ab.x + ab.y * ab.y;
        let d = proj / l;

        if (d <= 0) {
            cp = a;
        } else if (d >= 1) {
            cp = b;
        } else {
            cp = a + ab * d;
            cp = {x: a.x + ab.x * d, y: a.y + ab.y * d};
        }

        let dx = p.x - cp.x;
        let dy = p.y - cp.y;
        let d2 = dx * dx + dy * dy;
        return {d2: d2, cp: cp};
    }

    static AABB(a, b) {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
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
        return (v1.x * v2.x) + (v1.y * v2.y);
    }

    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
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

    static intersectsEdge(a, b, normal, offset) {
        let ab = {x: b.x - a.x, y: b.y - a.y};
        let t = (offset - (normal.x * a.x + normal.y * a.y)) / (normal.x * ab.x + normal.y * ab.y);

        return {x: a.x + t * ab.x, y: a.y + t * ab.y};
    }

    static nearEqual(a, b) {
        if (a.x) {
            return this.nearEqual(a.x, b.x) && this.nearEqual(a.y, b.y);
        } else {
            return Math.abs(a - b) < 0.0005;
        }
    }

    static dist(v1, v2) {
        v2 = v2 || {x: 0, y: 0};
        let dx = v1.x - v2.x;
        let dy = v1.y - v2.y;
        return dx * dx + dy * dy;
    }

    static sub(v1, v2) {
        return {x: v1.x - v2.x, y: v1.y - v2.y};
    }

    static mult(v, m) {
        return {x: v.x * m, y: v.y * m};
    }

    static add(v1, v2) {
        return {x: v1.x + v2.x, y: v1.y + v2.y};
    }
}

start();
window.requestAnimationFrame(update);