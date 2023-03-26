const raindrops = [];
const ripples = [];

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < 100; i++) {
    raindrops.push(new Raindrop());
  }
}

function draw() {
  background(0, 30, 60);
  for (const raindrop of raindrops) {
    raindrop.update();
    raindrop.display();
    if (raindrop.y > raindrop.bottom) {
      ripples.push(new Ripple(raindrop.x, raindrop.y));
      raindrop.reset();
    }
  }
  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i];
    ripple.update();
    ripple.display();
    if (ripple.finished()) {
      ripples.splice(i, 1);
    }
  }
}

class Raindrop {
  constructor() {
    this.reset();
  }
  update() {
    this.y += this.speed;
  }
  display() {
    strokeWeight(2);
    stroke(0, 200, 200);
    line(this.x, this.y, this.x, this.y + this.len);
  }
  reset() {
    this.x = random(width);
    this.y = random(-height, -100);
    this.len = random(10, 20);
    this.speed = random(5, 10);
    this.bottom = height - random(0, 200);
  }
}

class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.alpha = 255;
  }
  update() {
    this.radius += 5;
    this.alpha -= 5;
  }
  display() {
    noFill();
    stroke(0, 200, 200, this.alpha);
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2, this.radius);
  }
  finished() {
    return this.alpha < 0;
  }
}
