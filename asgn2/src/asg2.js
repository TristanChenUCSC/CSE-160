// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
  gl.enable(gl.DEPTH_TEST);

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
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Ge the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// UI Globals
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT
let g_globalAngle = 0;

function addActionsForHtmlUI() {

  // Buttons
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; undoStack = []; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; };
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; };

  // Sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
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
  gl.clearColor(0.271, 0.694, 1.0, 1.0);

  renderAllShapes();
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
  undoStack = [];

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

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0)
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // body
  var body = new Cube();
  body.color = [1.0, 1.0, 1.0, 1.0];
  body.matrix.translate(-0.25, -0.35, 0.0);
  body.matrix.scale(0.35, 0.6, 0.28);
  body.render();

  // head
  var head = new Cube();
  head.color = [0.25, 0.25, 0.25, 1.0];
  head.matrix.translate(-0.2, 0.25, -0.07);
  head.matrix.scale(0.25, 0.3, 0.25);
  head.render();

  // hair (wool)
  var hair = new Cube();
  hair.color = [1.0, 1.0, 1.0, 1.0];
  hair.matrix.translate(-0.22, 0.54, -0.09);
  hair.matrix.scale(0.29, 0.13, 0.29);
  hair.render();

  // left leg
  var leftLeg = new Cube();
  leftLeg.color = [0.25, 0.25, 0.25, 1.0];
  leftLeg.matrix.translate(-0.04, -0.72, 0.08);
  leftLeg.matrix.scale(0.11, 0.4, 0.11);
  leftLeg.render();

  // right leg
  var rightLeg = new Cube();
  rightLeg.color = [0.25, 0.25, 0.25, 1.0];
  rightLeg.matrix.translate(-0.22, -0.72, 0.08);
  rightLeg.matrix.scale(0.11, 0.4, 0.11);
  rightLeg.render();

  // left upper arm
  var leftUpperArm = new Cube();
  leftUpperArm.color = [0.25, 0.25, 0.25, 1.0];
  leftUpperArm.matrix.translate(0.1, 0, 0.08);
  leftUpperArm.matrix.scale(0.11, 0.2, 0.11);
  leftUpperArm.render();

  // left lower arm
  var leftLowerArm = new Cube();
  leftLowerArm.color = [0.25, 0.25, 0.25, 1.0];
  leftLowerArm.matrix.translate(0.1, -0.2, 0.08);
  leftLowerArm.matrix.scale(0.11, 0.2, 0.11);
  leftLowerArm.render();

  // right upper arm
  var rightUpperArm = new Cube();
  rightUpperArm.color = [0.25, 0.25, 0.25, 1.0];
  rightUpperArm.matrix.translate(-0.36, 0, 0.08);
  rightUpperArm.matrix.scale(0.11, 0.2, 0.11);
  rightUpperArm.render();

  // right lower arm
  var rightLowerArm = new Cube();
  rightLowerArm.color = [0.25, 0.25, 0.25, 1.0];
  rightLowerArm.matrix.translate(-0.36, -0.2, 0.08);
  rightLowerArm.matrix.scale(0.11, 0.2, 0.11);
  rightLowerArm.render();

  // tail
  var tail = new Cube();
  tail.color = [1.0, 1.0, 1.0, 1.0];
  tail.matrix.translate(-0.2, -0.3, 0.13);
  tail.matrix.rotate(45, 1, 0, 0);
  tail.matrix.scale(0.25, 0.2, 0.3);
  tail.render();

  // left ear
  var leftEar = new Cube();
  leftEar.color = [0.25, 0.25, 0.25, 1.0];
  leftEar.matrix.translate(0, 0.5, -0.04);
  leftEar.matrix.rotate(-45, 0, 0, 1)
  leftEar.matrix.scale(0.2, 0.06, 0.2);
  leftEar.render();
  
  // right ear
  var rightEar = new Cube();
  rightEar.color = [0.25, 0.25, 0.25, 1.0];
  rightEar.matrix.translate(-0.15, 0.5, -0.04);
  rightEar.matrix.scale(-1, 1, 1);
  rightEar.matrix.rotate(-45, 0, 0, 1)
  rightEar.matrix.scale(0.2, 0.06, 0.2);
  rightEar.render();
  
  // left eyelid
  var leftEyelid = new Cube();
  leftEyelid.color = [0.749, 0.651, 0.694, 1.0];
  leftEyelid.matrix.translate(-0.06, 0.48, -0.08);
  leftEyelid.matrix.scale(0.08, 0.03, 0.08);
  leftEyelid.render();

  // right eyelid
  var rightEyelid = new Cube();
  rightEyelid.color = [0.749, 0.651, 0.694, 1.0];
  rightEyelid.matrix.translate(-0.17, 0.48, -0.08);
  rightEyelid.matrix.scale(0.08, 0.03, 0.08);
  rightEyelid.render();

  // left eye
  var leftEye = new Cube();
  leftEye.color = [1.0, 1.0, 1.0, 1.0];
  leftEye.matrix.translate(-0.055, 0.42, -0.075);
  leftEye.matrix.scale(0.07, 0.07, 0.07);
  leftEye.render();

  // right eye
  var rightEye = new Cube();
  rightEye.color = [1.0, 1.0, 1.0, 1.0];
  rightEye.matrix.translate(-0.165, 0.42, -0.075);
  rightEye.matrix.scale(0.07, 0.07, 0.07);
  rightEye.render();

  // left pupil
  var leftPupil = new Cube();
  leftPupil.color = [0.0, 0.0, 0.0, 1.0];
  leftPupil.matrix.translate(-0.04, 0.425, -0.08);
  leftPupil.matrix.scale(0.04, 0.04, 0.04);
  leftPupil.render();

  // right pupil
  var rightPupil = new Cube();
  rightPupil.color = [0.0, 0.0, 0.0, 1.0];
  rightPupil.matrix.translate(-0.15, 0.425, -0.08);
  rightPupil.matrix.scale(0.04, 0.04, 0.04);
  rightPupil.render();

  // left nostril
  var leftNostril = new Cube();
  leftNostril.color = [0.18, 0.18, 0.18, 1.0];
  leftNostril.matrix.translate(-0.05, 0.29, -0.072);
  leftNostril.matrix.scale(0.04, 0.04, 0.04);
  leftNostril.render();

  // right nostril
  var rightNostril = new Cube();
  rightNostril.color = [0.18, 0.18, 0.18, 1.0];
  rightNostril.matrix.translate(-0.14, 0.29, -0.072);
  rightNostril.matrix.scale(0.04, 0.04, 0.04);
  rightNostril.render();
  
  // Check the time at the end of this function and show on webpage
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

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
