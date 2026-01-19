// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// UI Globals
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT
let g_circleSegments = 8;

function addActionsForHtmlUI() {

  // Buttons
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };
  document.getElementById('snakesButton').onclick = function() { drawSnakes(); };

  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; };
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; };

  // Sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_circleSegments = this.value; });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Set up actions for HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapesList = [];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  }
  else if (g_selectedType == CIRCLE) {
    point = new Circle();
    point.segments = g_circleSegments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x, y];
}

function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each shape in the shapes list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  
  // Check the time at the end of this function and show on webpage
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawSnakes() {
  g_shapesList = [];
  let triangle;

  // First snake
  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.5, 0.6, -0.5, 0.3, -0.4, 0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.3, -0.5, 0.3, -0.4, 0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.5, -0.4, 0.6, -0.3, 0.5];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.6, 0.5, -0.5, 0.6, -0.5, 0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.6, 0.5, -0.6, 0.4, -0.5, 0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.5, 0.3, -0.6, 0.4, -0.5, 0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.4, -0.4, 0.5, -0.3, 0.5];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.4, -0.4, 0.5, -0.3, 0.5];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.4, -0.3, 0.4, -0.3, 0.5];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.3, -0.4, 0.4, -0.3, 0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.4, -0.4, 0.5, -0.3, 0.5];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.5, 0.3, -0.4, 0.3, -0.5, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.2, -0.4, 0.3, -0.5, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.2, -0.4, 0.1, -0.5, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.2, -0.4, 0.1, 0.1, 0.1];
  g_shapesList.push(triangle);
  
  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.1, 0.2, -0.4, 0.2, 0.1, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.1, 0.2, 0.2, 0.2, 0.1, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.1, 0.2, 0.2, 0.2, 0.2, 0.3];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.5, 0.6, -0.5, 0.7, -0.4, 0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.5, 0.6, -0.4, 0.7, -0.4, 0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.53, 0.45, -0.53, 0.55, -0.48, 0.45];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.53, 0.55, -0.48, 0.55, -0.48, 0.45];
  g_shapesList.push(triangle);
  
  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.43, 0.45, -0.43, 0.55, -0.38, 0.45];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.38, 0.55, -0.43, 0.55, -0.38, 0.45];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.53, 0.55, -0.505, 0.50, -0.48, 0.55];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.43, 0.55, -0.405, 0.50, -0.38, 0.55];
  g_shapesList.push(triangle);
  
  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.4, 0.1, -0.3, 0.1, -0.35, 0.15];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, 0.2, -0.15, 0.15, -0.1, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [0, 0.1, 0.05, 0.15, 0.1, 0.1];
  g_shapesList.push(triangle);

  // Second snake
  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, 0.1, -0.1, 0, -0.2, 0];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.8, -0.1, 0, -0.2, 0];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.8, -0.1, 0, -0.1, -0.8];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.5, -0.2, -0.6, -0.3, -0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.7, -0.2, -0.6, -0.3, -0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.7, -0.3, -0.6, -0.3, -0.7];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.7, -0.2, -0.8, -0.3, -0.7];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, -0.5, -0.1, -0.6, 0, -0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, -0.7, -0.1, -0.6, 0, -0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, -0.7, 0, -0.7, 0, -0.6];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, -0.7, -0.1, -0.8, 0, -0.7];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, -0.8, -0.2, -0.8, -0.1, -0.9];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.8, -0.1, -0.8, -0.2, -0.9];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.23, -0.65, -0.23, -0.75, -0.18, -0.75];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.23, -0.65, -0.18, -0.65, -0.18, -0.75];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.13, -0.65, -0.13, -0.75, -0.08, -0.75];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [-0.13, -0.65, -0.08, -0.65, -0.08, -0.75];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.23, -0.75, -0.205, -0.7, -0.18, -0.75];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [-0.13, -0.75, -0.105, -0.7, -0.08, -0.75];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, 0, -0.15, -0.05, -0.1, -0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.2, -0.2, -0.15, -0.25, -0.2, -0.3];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [-0.1, -0.4, -0.15, -0.45, -0.1, -0.5];
  g_shapesList.push(triangle);

  // Third Snake
  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.3, 0.1, 0.4, 0.1, 0.4, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.4, 0.2, 0.9, 0.2, 0.4, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.9, 0.1, 0.9, 0.2, 0.4, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.6, 0.2, 0.7, 0.2, 0.7, 0.3];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.7, 0.3, 0.8, 0.3, 0.7, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.7, 0.2, 0.8, 0.2, 0.8, 0.3];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.8, 0.3, 0.8, 0.2, 0.9, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.6, 0.1, 0.7, 0.1, 0.7, 0];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.7, 0, 0.7, 0.1, 0.8, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.8, 0.1, 0.8, 0, 0.7, 0];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.8, 0, 0.8, 0.1, 0.9, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.3, 0.1, 0.3, -0.4, 0.4, -0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.3, 0.1, 0.4, -0.4, 0.4, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.3, -0.4, 0.4, -0.4, 0.4, -0.5];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.4, -0.5, 0.4, -0.4, 0.7, -0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.4, -0.5, 0.7, -0.5, 0.7, -0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.7, -0.5, 0.7, -0.4, 0.8, -0.4];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [0.9, 0.2, 1.0, 0.2, 0.9, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [0.9, 0.2, 1.0, 0.1, 0.9, 0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [0.75, 0.23, 0.75, 0.18, 0.85, 0.23];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [0.85, 0.18, 0.75, 0.18, 0.85, 0.23];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [0.85, 0.08, 0.75, 0.08, 0.85, 0.13];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [1.0, 1.0, 1.0, 1.0];
  triangle.customVertices = [0.75, 0.13, 0.75, 0.08, 0.85, 0.13];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [0.85, 0.23, 0.8, 0.205, 0.85, 0.18];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.0, 0.0, 0.0, 1.0];
  triangle.customVertices = [0.85, 0.13, 0.8, 0.105, 0.85, 0.08];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.4, 0.2, 0.45, 0.15, 0.5, 0.2];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.4, 0.0, 0.35, -0.05, 0.4, -0.1];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.3, -0.2, 0.35, -0.25, 0.3, -0.3];
  g_shapesList.push(triangle);

  triangle = new Triangle();
  triangle.color = [0.9, 1.0, 0.0, 1.0];
  triangle.customVertices = [0.5, -0.5, 0.55, -0.45, 0.6, -0.5];
  g_shapesList.push(triangle);

  renderAllShapes();
}