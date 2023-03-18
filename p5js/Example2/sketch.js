// TODO: グローバル変数 tokenIDをseedとしてランダム生成

function setup() {
  createCanvas(800, 800);
  noLoop();
}

const COUNT = 60;
const R = 300;

const N = 23;
const M = 60;

function getPoints() {
  return [...Array(COUNT).keys()].map((i) => {
    const x = cos((TAU * i * N) / M) * R;
    const y = sin((TAU * i * N) / M) * R;
    return [x, y];
  });
}

function draw() {
  const pts = getPoints();
  background(222);
  stroke('blue');

  // 線
  translate(width / 2, height / 2);
  noFill();
  beginShape();
  pts.forEach((xy) => vertex(...xy));
  endShape(CLOSE);

  // 点
  fill('blue');
  pts.forEach((xy) => circle(...xy, 5));
}
