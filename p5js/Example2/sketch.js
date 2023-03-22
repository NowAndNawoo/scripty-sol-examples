let x, y;
let xSpeed, ySpeed;
let c;
const r = 150;

function setup() {
  createCanvas(windowWidth, windowHeight);
  x = width / 2;
  y = height / 2;
  randomSeed(tokenId);
  xSpeed = random(-5, 5);
  ySpeed = random(-5, 5);
  c = color(random(255), random(255), random(255));
  fill(c);
  console.log({ tokenId, color: c.toString(), xSpeed, ySpeed });
}

function draw() {
  background(255);
  x += xSpeed;
  y += ySpeed;
  if (x < r || x > width - r) xSpeed = -xSpeed;
  if (y < r || y > height - r) ySpeed = -ySpeed;
  ellipse(x, y, r * 2);
}
