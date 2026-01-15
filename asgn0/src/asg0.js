// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
}

function angleBetween(v1, v2) {
  let dotProd = Vector3.dot(v1, v2);
  let magV1 = v1.magnitude();
  let magV2 = v2.magnitude();
  let angle = Math.acos(dotProd / (magV1 * magV2));
  angle = angle * (180 / Math.PI);
  return angle;
}

function areaTriangle(v1, v2) {
  let crossProd = Vector3.cross(v1, v2);
  let area = 0.5 * crossProd.magnitude();
  return area;
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + v.elements[0] * 20, centerY - v.elements[1] * 20);
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let x1 = parseFloat(document.getElementById('x1').value);
  let y1 = parseFloat(document.getElementById('y1').value);

  let x2 = parseFloat(document.getElementById('x2').value);
  let y2 = parseFloat(document.getElementById('y2').value);

  let v1 = new Vector3([x1, y1, 0])
  let v2 = new Vector3([x2, y2, 0])
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let x1 = parseFloat(document.getElementById('x1').value);
  let y1 = parseFloat(document.getElementById('y1').value);

  let x2 = parseFloat(document.getElementById('x2').value);
  let y2 = parseFloat(document.getElementById('y2').value);

  let v1 = new Vector3([x1, y1, 0])
  let v2 = new Vector3([x2, y2, 0])
  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  let operation = document.getElementById('operations').value;
  if (operation === 'add') {
    let v3 = v1.add(v2);
    drawVector(v3, 'green');
  } else if (operation === 'sub') {
    let v3 = v1.sub(v2);
    drawVector(v3, 'green');
  } else if (operation === 'mul') {
    let scalar = parseFloat(document.getElementById('scalar').value);
    let v3 = v1.mul(scalar);
    let v4 = v2.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'div') {
    let scalar = parseFloat(document.getElementById('scalar').value);
    let v3 = v1.div(scalar);
    let v4 = v2.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'magnitude') {
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    console.log('Magnitude v1: ' + mag1);
    console.log('Magnitude v2: ' + mag2);
  } else if (operation === 'normalize') {
    let v3 = v1.normalize();
    let v4 = v2.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (operation === 'angle') {
    let angle = angleBetween(v1, v2);
    console.log('Angle: ' + angle);
  } else if (operation === 'area') {
    let area = areaTriangle(v1, v2);
    console.log('Area of the triangle: ' + area);
  }
}