function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100);
  frameRate(5);
}

function drawCircle(x, y) {
  noStroke();
  for (let i = 10; i >= 1; i--) {
    const hue = map((i + frameCount) % 10, 0, 10, 150, 220);
    fill(hue, random(50, 100), random(20, 100));
    circle(x, y, i * 20);
  }
}

function draw() {
  background(0);
  for (let y = 0; y <= 800; y += 100) {
    for (let x = 0; x <= 800; x += 100) {
      drawCircle(x, y);
    }
  }
}
