let stars = [];
let angle = 0;

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < 1500; i++) {
    stars[i] = new Star();
  }
}

function draw() {
  background(0);
  translate(width / 2, height / 2);
  rotate(angle);
  angle += 0.002;
  for (let star of stars) {
    star.update();
    star.show();
  }
}

class Star {
  constructor() {
    this.init(random(width));
  }
  init(zValue) {
    this.z = zValue;
    this.x = random(-width, width);
    this.y = random(-height, height);
    this.color = color(random(50, 255), random(50, 255), random(200, 255));
    this.speed = random(3, 10);
    this.offsetX = random(1000);
    this.offsetY = random(1000);
  }
  update() {
    this.z -= this.speed;
    if (this.z < 1) this.init(width);
  }
  show() {
    let scaleFactor = map(this.z, 0, width, 2, 0);
    let sx = this.x * scaleFactor;
    let sy = this.y * scaleFactor;
    let px = this.x * (scaleFactor + this.speed * 0.01);
    let py = this.y * (scaleFactor + this.speed * 0.01);
    let distance = dist(0, 0, sx, sy);
    let alphaValue = map(distance, 0, 500, 0, 255);
    this.color.setAlpha(alphaValue);
    stroke(this.color);
    line(px, py, sx, sy);
  }
}
