function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 100);
  noStroke();
  frameRate(3);
  rectMode(CENTER);
}

function draw() {
  const xCount = 20;
  const yCount = 20;
  const side = width / xCount;
  background(color(85, 10, 100));
  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {
      fill(random(70, 100), 50, 100);
      const rx = (x + 0.5 + random(-0.1, 0.1)) * side;
      const ry = (y + 0.5 + random(-0.1, 0.1)) * side;
      const rs = random(0.3, 0.7) * side;
      rect(rx, ry, rs, rs);
    }
  }
}
