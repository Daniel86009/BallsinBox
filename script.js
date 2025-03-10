const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
const cNumText = document.getElementById("cNum");
const gSlider = document.getElementById("gSlider");
const gText = document.getElementById("gravity");
const rSlider1 = document.getElementById("rSlider1");
const rSlider2 = document.getElementById("rSlider2");
const minRText = document.getElementById("minR");
const maxRText = document.getElementById("maxR");

const circles = [];
var cNum = 0;
const isMobile = !window.matchMedia('(hover: hover)').matches;

var g = 0.2;
const wallFriction = 0.7;
var minRadius = 5;
var maxRadius = 20

var mouse = {x: 0, y: 0, ox: 0, oy:0, down: false}



function setUp() {
  c.width = document.documentElement.clientWidth - 0.01;
  c.height = document.documentElement.clientHeight - 0.01;
  gSlider.value = g;
  rSlider1.value = minRadius;
  rSlider2.value = maxRadius;
  for (let i = 0; i < cNum; i++) {
    circles.push(new circleObj());
  }
  
  c.addEventListener("click", function() {
    if (isMobile) {
      circles.push(new circleObj(event.clientX, event.clientY));
    }
  });

  c.addEventListener("mousedown", function() {
    mouse.down = true;
  });
  c.addEventListener("mouseup", function() {
    mouse.down = false;
  });
  
  document.addEventListener("mousemove", function() {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("resize", function() {
    c.width = document.documentElement.clientWidth - 0.01;
    c.height = document.documentElement.clientHeight - 0.01;
  });

  gSlider.addEventListener("input", function() {
    g = gSlider.value;
    gText.innerHTML = g;
  });
}

function update() {
  ctx.clearRect(0, 0, c.width, c.height);
  
  var steps = 8;
  var delta = 1 / steps;
  
  while (steps--) {
    for (var i = 0; i < circles.length; i++) {
      circles[i].update(delta);
    }
  }
  
  for (var i = 0; i < circles.length; i++) {
    circles[i].wallCol();
    for (var j = 0; j < circles.length; j++){
      //circles[i].objectCol(circles[j]);
    }
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
    
  update(delta) {
    delta *= delta;
    this.ya = g;
    var nx = this.x * 2 - this.ox + this.xa * delta;
    var ny = this.y * 2 - this.oy + this.ya * delta;
    
    this.ox = this.x;
    this.oy = this.y;
    
    this.x = nx;
    this.y = ny;

    if (mouse.down == false) {
      this.mouseCol();
    }


    
    for (let i = 0; i < circles.length; i ++) {
      this.objectCol(circles[i]);
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

function dot(x1, y1, x2, y2) {
  return (x1 * x2) + (y1 * y2);
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

setUp();
window.requestAnimationFrame(update);
