import * as math from 'https://cdn.jsdelivr.net/npm/mathjs@13/+esm';
import * as cfUtils from '../shared/cf_utils.js';

let b1 = [1, 1.618033988749895];
let b2 = [-1.618033988749895, 1];

let p1 = null, p2 = null, hasReturnedFar = false;

let latticeSet = false;

function cDiv(a, b) {
  const d = b[0]*b[0] + b[1]*b[1];
  return [(a[0]*b[0] + a[1]*b[1]) / d, (a[1]*b[0] - a[0]*b[1]) / d];
}

function hpPt(b1, b2) {
  let pt = Math.hypot(...b1) > Math.hypot(...b2) ? cDiv(b1, b2) : cDiv(b2, b1);
  if (pt[1] < 0) pt = [-pt[0], -pt[1]];
  return pt;
}

function checkCF(flow) {
  console.log('checkPeriodSnap called, flow:', flow, 'p1:', p1);
  if (p1 === null) { return; }
  if (flow !== 0) { return; }

  

  const dist1 = math.norm(math.subtract(b1,p1));
  const dist2 = math.norm(math.subtract(b2,p2));

  const dist = Math.sqrt(dist1*dist1+dist2*dist2);
  

 if (dist < .01) {
    b1 = [...p1];
    b2 = [...p2];
    hasReturnedFar = false;
  }
}

// Input: basis as [[a, b], [c, d]] (rows are basis vectors)
// Output: reduced basis with b1 = shortest vector
function lagrangeGauss(b1, b2) {
  b1 = math.matrix(b1);
  b2 = math.matrix(b2);
  const normSq = v => math.dot(v, v);

  if (normSq(b1) > normSq(b2)) [b1, b2] = [b2, b1];

  while (true) {
    const m = Math.round(math.dot(b1, b2) / normSq(b1));
    b2 = math.subtract(b2, math.multiply(m, b1));
    if (normSq(b2) >= normSq(b1)) break;
    [b1, b2] = [b2, b1];
  }
  return [b1.toArray(), b2.toArray()];
}

const fps = 60;

// Geodesic (hyperbolic diagonal) flow matrix — stretches one axis, shrinks the other
function gFlow(dTime) {
  return math.matrix([
    [Math.exp(dTime / (3 * fps)), 0],
    [0, Math.exp(-dTime / (3 * fps))]
  ]);
}

// Horocyclic (shear) flow matrix (vertical)
function hFlow(dTime) {
  return math.matrix([
    [1, 0],
    [dTime / fps, 1]
  ]);
}

// Horocyclic (shear) flow matrix (horizontal)
function hFlowH(dTime) {
  return math.matrix([
    [1, dTime / fps],
    [0, 1]
  ]);
}

export function onSetLattice(inputs, handle) {
  const alpha = cfUtils.quadCFStrings(inputs.cfPrefix ?? '', inputs.cfPeriod ?? '0');
  const beta = cfUtils.quadCFStrings('', cfUtils.reverseCFString(inputs.cfPeriod) ?? '0');
  b1 = [1, beta];
  b2 = [-alpha, 1];

  [b1,b2] = lagrangeGauss(b1,b2);
  
  

  //handle.setUniform('uLattice', [1, beta, -alpha, 1]);
  latticeSet = true;
}

export function setup(engine) {
  b1 = [1, 1.618033988749895];
  b2 = [-1.618033988749895, 1];
}

export function onFrame(engine, time, deltaTime, frame) {
  const flow = engine.getUniformValue('uFlow');
  const speed = engine.getUniformValue('uSpeed');

  let m;
  switch (flow) {
    case 1:  m = hFlow(speed); break;
    case 2:  m = hFlowH(speed); break;
    default: m = gFlow(speed * 2.);
  }

  const mb1 = math.multiply(m, b1);
  const mb2 = math.multiply(m, b2);

  [b1, b2] = lagrangeGauss(mb1, mb2);
  checkCF(flow);

  engine.setUniformValue('uLattice', [b1[0], b1[1], b2[0], b2[1]]);
  engine.setUniformValue('uNewLattice', latticeSet);
  latticeSet = false;
}
