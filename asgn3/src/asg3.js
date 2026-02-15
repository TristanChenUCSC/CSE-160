// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }

  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_whichTexture;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let camera;

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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
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

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// UI Globals
let g_globalAngleX = 0
let g_globalAngleY = 20;
let animation = true;

let bodyX = 0;

let leftUpperArmX = 0;
let leftUpperArmY = 0;
let leftUpperArmZ = 0;

let leftLowerArmX = 0;
let leftLowerArmY = 0;
let leftLowerArmZ = 0;

let leftHoofX = 0;
let leftHoofY = 0;
let leftHoofZ = 0;

let rightUpperArmX = 0;
let rightUpperArmY = 0;
let rightUpperArmZ = 0;

let rightLowerArmX = 0;
let rightLowerArmY = 0;
let rightLowerArmZ = 0;

let rightHoofX = 0;
let rightHoofY = 0;
let rightHoofZ = 0;

let headX = 0;
let headY = 0;
let headZ = 0;

let leftLegX = 0;
let leftLegY = 0;
let leftLegZ = 0;

let rightLegX = 0;
let rightLegY = 0;
let rightLegZ = 0;

function addActionsForHtmlUI() {
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngleY = this.value; renderAllShapes(); });
  document.getElementById('animationOnButton').onclick = function() {animation = true; };
  document.getElementById('animationOffButton').onclick = function() {animation = false; };

  document.getElementById('LeftUpperArmSlideX').addEventListener('mousemove', function() { leftUpperArmX = this.value; renderAllShapes(); });
  document.getElementById('LeftUpperArmSlideY').addEventListener('mousemove', function() { leftUpperArmY = this.value; renderAllShapes(); });
  document.getElementById('LeftUpperArmSlideZ').addEventListener('mousemove', function() { leftUpperArmZ = this.value; renderAllShapes(); });

  document.getElementById('LeftLowerArmSlideX').addEventListener('mousemove', function() { leftLowerArmX = this.value; renderAllShapes(); });
  document.getElementById('LeftLowerArmSlideY').addEventListener('mousemove', function() { leftLowerArmY = this.value; renderAllShapes(); });
  document.getElementById('LeftLowerArmSlideZ').addEventListener('mousemove', function() { leftLowerArmZ = this.value; renderAllShapes(); });

  document.getElementById('LeftHoofSlideX').addEventListener('mousemove', function() { leftHoofX = this.value; renderAllShapes(); });
  document.getElementById('LeftHoofSlideY').addEventListener('mousemove', function() { leftHoofY = this.value; renderAllShapes(); });
  document.getElementById('LeftHoofSlideZ').addEventListener('mousemove', function() { leftHoofZ = this.value; renderAllShapes(); });

  document.getElementById('RightUpperArmSlideX').addEventListener('mousemove', function() { rightUpperArmX = this.value; renderAllShapes(); });
  document.getElementById('RightUpperArmSlideY').addEventListener('mousemove', function() { rightUpperArmY = this.value; renderAllShapes(); });
  document.getElementById('RightUpperArmSlideZ').addEventListener('mousemove', function() { rightUpperArmZ = this.value; renderAllShapes(); });

  document.getElementById('RightLowerArmSlideX').addEventListener('mousemove', function() { rightLowerArmX = this.value; renderAllShapes(); });
  document.getElementById('RightLowerArmSlideY').addEventListener('mousemove', function() { rightLowerArmY = this.value; renderAllShapes(); });
  document.getElementById('RightLowerArmSlideZ').addEventListener('mousemove', function() { rightLowerArmZ = this.value; renderAllShapes(); });

  document.getElementById('RightHoofSlideX').addEventListener('mousemove', function() { rightHoofX = this.value; renderAllShapes(); });
  document.getElementById('RightHoofSlideY').addEventListener('mousemove', function() { rightHoofY = this.value; renderAllShapes(); });
  document.getElementById('RightHoofSlideZ').addEventListener('mousemove', function() { rightHoofZ = this.value; renderAllShapes(); });

  document.getElementById('HeadSlideX').addEventListener('mousemove', function() { headX = this.value; renderAllShapes(); });
  document.getElementById('HeadSlideY').addEventListener('mousemove', function() { headY = this.value; renderAllShapes(); });
  document.getElementById('HeadSlideZ').addEventListener('mousemove', function() { headZ = this.value; renderAllShapes(); });

  document.getElementById('LeftLegSlideX').addEventListener('mousemove', function() { leftLegX = this.value; renderAllShapes(); });
  document.getElementById('LeftLegSlideY').addEventListener('mousemove', function() { leftLegY = this.value; renderAllShapes(); });
  document.getElementById('LeftLegSlideZ').addEventListener('mousemove', function() { leftLegZ = this.value; renderAllShapes(); });

  document.getElementById('RightLegSlideX').addEventListener('mousemove', function() { rightLegX = this.value; renderAllShapes(); });
  document.getElementById('RightLegSlideY').addEventListener('mousemove', function() { rightLegY = this.value; renderAllShapes(); });
  document.getElementById('RightLegSlideZ').addEventListener('mousemove', function() { rightLegZ = this.value; renderAllShapes(); });

}

function initTextures() {
  var image0 = new Image();
  var image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendImageToTEXTURE0(image0); };
  image1.onload = function(){ sendImageToTEXTURE1(image1); };
  // Tell the browser to load an image
  image0.src = 'barn.png';
  image1.src = 'Hay.png';

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);
}


function main() {
  setupWebGL();
  connectVariablesToGLSL();

  camera = new Camera();

  // Set up actions for HTML UI elements
  addActionsForHtmlUI();

  document.onkeydown = keydown;

  canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
  });


  canvas.addEventListener("mousemove", (ev) => {
    if (document.pointerLockElement === canvas) {
      if (ev.movementX > 0) {
        camera.panRight(ev.movementX * 0.7);
      }
      else if (ev.movementX < 0) {
        camera.panLeft(-ev.movementX * 0.7);
      }
      if (ev.movementY > 0) {
        camera.panUp(ev.movementY * 0.7);
      }
      else if (ev.movementY < 0) {
        camera.panDown(-ev.movementY * 0.7);
      }
    }
  });



  initTextures();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.271, 0.694, 1.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

let poke = false;
let poke_startTime;

function click(ev) {
  let x = Math.ceil(camera.at.elements[0]) + 16;
  let y = Math.ceil(camera.at.elements[2]) + 16;

  if (x >= 0 && x < 32 && y >= 0 && y < 32) {
    if (g_map[y][x] == 1) {
      g_map[y][x] = 0;
    }
    else {
      g_map[y][x] = 1;
    }
  }
    
}

function updateAnimationAngles() {
  if (animation && !poke) {
    resetAngles();

    leftUpperArmX = 15 * Math.sin(g_seconds);
    leftLowerArmX = 45;
    leftHoofX = 15 * Math.sin(g_seconds);

    rightUpperArmX = 15 * Math.sin(g_seconds);
    rightLowerArmX = 45;
    rightHoofX = 15 * Math.sin(g_seconds); 

    headX = 10 * Math.sin(g_seconds);
    headY = 10 * Math.sin(g_seconds);
  }

  else if (!animation && poke) {
    resetAngles()

    bodyX = -380 * Math.sin(g_seconds - poke_startTime);
    headX = 15 * Math.sin(g_seconds - poke_startTime);

    leftUpperArmX = 90 * Math.sin(g_seconds - poke_startTime);
    leftLowerArmX = 30;

    rightUpperArmX = 90 * Math.sin(g_seconds - poke_startTime);
    rightLowerArmX = 30;

    leftLegX = 30 * Math.sin(g_seconds - poke_startTime);
    rightLegX = 90 * Math.sin(g_seconds - poke_startTime);

    if (g_seconds - poke_startTime >= 1.7) {
      poke = false;
      animation = true;
    }
  }
}

function resetAngles() {
  bodyX = 0;

  leftUpperArmX = 0;
  leftUpperArmY = 0;
  leftUpperArmZ = 0;

  leftLowerArmX = 0;
  leftLowerArmY = 0;
  leftLowerArmZ = 0;

  leftHoofX = 0;
  leftHoofY = 0;
  leftHoofZ = 0;

  rightUpperArmX = 0;
  rightUpperArmY = 0;
  rightUpperArmZ = 0;

  rightLowerArmX = 0;
  rightLowerArmY = 0;
  rightLowerArmZ = 0;

  rightHoofX = 0;
  rightHoofY = 0;
  rightHoofZ = 0;

  headX = 0;
  headY = 0;
  headZ = 0;

  leftLegX = 0;
  leftLegY = 0;
  leftLegZ = 0;

  rightLegX = 0;
  rightLegY = 0;
  rightLegZ = 0;
}

function keydown(ev) {
  // W key
  if (ev.keyCode == 87) {
    camera.moveForward();
  }
  // S key
  else if (ev.keyCode == 83) {
    camera.moveBackwards();
  }
  // A key 
  else if (ev.keyCode == 65) {
    camera.moveLeft();
  }
  // D key
  else if (ev.keyCode == 68) {
    camera.moveRight();
  }
  // Q key
  else if (ev.keyCode == 81) {
    camera.panLeft(5);
  }
  // E key
  else if (ev.keyCode == 69) {
    camera.panRight(5);
  }
}

// 32 x 32
var g_map = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
  [0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0],
  [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0],
  [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,1,0,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

function drawMap() {
  for (x=0;x<32;x++) {
    for (y=0;y<32;y++) {
      if (g_map[y][x] == 1) {
        var cube = new Cube();
        cube.color = [1.0, 1.0, 1.0, 1.0];
        cube.textureNum = 1;
        cube.matrix.translate(x-16, -0.75, y-16);
        cube.render();
      }
    }
  }
}


function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(camera.fov, canvas.width/canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2], 
    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2], 
    camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw Map
  drawMap();

  // Draw Floor
  var floor = new Cube();
  floor.color = [0.454, 0.8, 0.317, 1.0];
  floor.textureNum = -2;
  floor.matrix.translate(0, -0.75, 0);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  // Draw Barn
  var barn = new Cube();
  barn.color = [1.0, 1.0, 1.0, 1.0];
  barn.textureNum = 0;
  barn.matrix.translate(0, 7, 0);
  barn.matrix.scale(32,32,32);
  barn.matrix.translate(-0.5, -0.5, -0.5);
  barn.render();

  // Draw simple sky
  var sky = new Cube();
  sky.color = [0.502, 0.792, 0.706, 1.0];
  sky.matrix.translate(0, 20, 0);
  sky.matrix.scale(32,0,32);
  sky.matrix.translate(-0.5, 0, -0.5);
  sky.render();

  // Draw Baby sheep
  renderBabySheep(-0.5, -0.65, 1.5, 0);
  renderBabySheep(0.2, -0.65, 1, 45);
  renderBabySheep(-1.2, -0.65, 1, -45);

  // --- Shawn the Sheep ---
  // body
  var body = new Cube();
  body.color = [1.0, 1.0, 1.0, 1.0];
  body.matrix.translate(-0.25, -0.38, 0.0);
  body.matrix.rotate(180, 0, 1, 0);
  var bodyCoords = new Matrix4(body.matrix);
  body.matrix.scale(0.35, 0.6, 0.28);
  body.render();

  // head
  var head = new Cube();
  head.color = [0.25, 0.25, 0.25, 1.0];
  head.matrix = new Matrix4(bodyCoords);
  head.matrix.translate(0.3, 0.9, -0.07);

  head.matrix.rotate(headX, 1, 0, 0);
  head.matrix.rotate(headY, 0, 1, 0);
  head.matrix.rotate(headZ, 0, 0, 1);

  var headCoords = new Matrix4(head.matrix)
  head.matrix.rotate(180, 0, 0, 1);
  head.matrix.scale(0.25, 0.3, 0.25);
  head.render();

  // hair (wool)
  var hair = new Cube();
  hair.color = [1.0, 1.0, 1.0, 1.0];
  hair.matrix = new Matrix4(headCoords)
  hair.matrix.translate(-0.27, 0, -0.02);
  hair.matrix.scale(0.29, 0.13, 0.29);
  hair.render();

  // left leg
  var leftLeg = new Cube();
  leftLeg.color = [0.25, 0.25, 0.25, 1.0];
  leftLeg.matrix = new Matrix4(bodyCoords);
  leftLeg.matrix.translate(0.32, 0.03, 0.08);

  leftLeg.matrix.rotate(leftLegX, 1, 0, 0);
  leftLeg.matrix.rotate(leftLegY, 0, 1, 0);
  leftLeg.matrix.rotate(leftLegZ, 0, 0, 1);

  leftLeg.matrix.rotate(180, 0, 0, 1);
  leftLeg.matrix.scale(0.11, 0.4, 0.11);
  leftLeg.render();

  // right leg
  var rightLeg = new Cube();
  rightLeg.color = [0.25, 0.25, 0.25, 1.0];
  rightLeg.matrix = new Matrix4(bodyCoords);
  rightLeg.matrix.translate(0.14, 0.03, 0.08);

  rightLeg.matrix.rotate(rightLegX, 1, 0, 0);
  rightLeg.matrix.rotate(rightLegY, 0, 1, 0);
  rightLeg.matrix.rotate(rightLegZ, 0, 0, 1);

  rightLeg.matrix.rotate(180, 0, 0, 1);
  rightLeg.matrix.scale(0.11, 0.4, 0.11);
  rightLeg.render();

  // left upper arm
  var leftUpperArm = new Cube();
  leftUpperArm.color = [0.25, 0.25, 0.25, 1.0];
  leftUpperArm.matrix = new Matrix4(bodyCoords);
  leftUpperArm.matrix.translate(0.46, 0.55, 0.08);

  leftUpperArm.matrix.rotate(leftUpperArmX, 1, 0, 0);
  leftUpperArm.matrix.rotate(leftUpperArmY, 0, 1, 0);
  leftUpperArm.matrix.rotate(leftUpperArmZ, 0, 0, 1);

  var leftUpperArmCoords = new Matrix4(leftUpperArm.matrix)
  leftUpperArm.matrix.rotate(180, 0, 0, 1);
  leftUpperArm.matrix.scale(0.11, 0.2, 0.11);
  leftUpperArm.render();

  // left lower arm
  var leftLowerArm = new Cube();
  leftLowerArm.color = [0.25, 0.25, 0.25, 1.0];
  leftLowerArm.matrix = new Matrix4(leftUpperArmCoords)
  leftLowerArm.matrix.translate(0, -0.15, 0);

  leftLowerArm.matrix.rotate(leftLowerArmX, 1, 0, 0);
  leftLowerArm.matrix.rotate(leftLowerArmY, 0, 1, 0);
  leftLowerArm.matrix.rotate(leftLowerArmZ, 0, 0, 1);

  var leftLowerArmCoords = new Matrix4(leftLowerArm.matrix)
  leftLowerArm.matrix.rotate(180, 0, 0, 1);
  leftLowerArm.matrix.scale(0.11, 0.2, 0.11);
  leftLowerArm.render();

  // left hoof
  var leftHoof = new Hemisphere();
  leftHoof.color = [0.25, 0.25, 0.25, 1.0];
  leftHoof.matrix = new Matrix4(leftLowerArmCoords)
  leftHoof.matrix.translate(-0.06, -0.2, 0.06);

  leftHoof.matrix.rotate(leftHoofX, 1, 0, 0);
  leftHoof.matrix.rotate(leftHoofY, 0, 1, 0);
  leftHoof.matrix.rotate(leftHoofZ, 0, 0, 1);

  leftHoof.matrix.translate(0, -0.1, 0);
  leftHoof.matrix.scale(0.1, 0.15, 0.1);
  leftHoof.render();

  // right upper arm
  var rightUpperArm = new Cube();
  rightUpperArm.color = [0.25, 0.25, 0.25, 1.0];
  rightUpperArm.matrix = new Matrix4(bodyCoords);
  rightUpperArm.matrix.translate(0, 0.55, 0.08);

  rightUpperArm.matrix.rotate(rightUpperArmX, 1, 0, 0);
  rightUpperArm.matrix.rotate(rightUpperArmY, 0, 1, 0);
  rightUpperArm.matrix.rotate(rightUpperArmZ, 0, 0, 1);

  var rightUpperArmCoords = new Matrix4(rightUpperArm.matrix)
  rightUpperArm.matrix.rotate(180, 0, 0, 1)
  rightUpperArm.matrix.scale(0.11, 0.2, 0.11);
  rightUpperArm.render();

  // right lower arm
  var rightLowerArm = new Cube();
  rightLowerArm.color = [0.25, 0.25, 0.25, 1.0];
  rightLowerArm.matrix = new Matrix4(rightUpperArmCoords)
  rightLowerArm.matrix.translate(0, -0.15, 0.);

  rightLowerArm.matrix.rotate(rightLowerArmX, 1, 0, 0);
  rightLowerArm.matrix.rotate(rightLowerArmY, 0, 1, 0);
  rightLowerArm.matrix.rotate(rightLowerArmZ, 0, 0, 1);

  var rightLowerArmCoords = new Matrix4(rightLowerArm.matrix)
  rightLowerArm.matrix.rotate(180, 0, 0, 1)
  rightLowerArm.matrix.scale(0.11, 0.2, 0.11);
  rightLowerArm.render();

  // right hoof
  var rightHoof = new Hemisphere();
  rightHoof.color = [0.25, 0.25, 0.25, 1.0];
  rightHoof.matrix = new Matrix4(rightLowerArmCoords)
  rightHoof.matrix.translate(-0.06, -0.2, 0.06);

  rightHoof.matrix.rotate(rightHoofX, 1, 0, 0);
  rightHoof.matrix.rotate(rightHoofY, 0, 1, 0);
  rightHoof.matrix.rotate(rightHoofZ, 0, 0, 1);

  rightHoof.matrix.translate(0, -0.1, 0);
  rightHoof.matrix.scale(0.1, 0.15, 0.1);
  rightHoof.render();


  // tail
  var tail = new Cube();
  tail.color = [1.0, 1.0, 1.0, 1.0];
  tail.matrix = new Matrix4(bodyCoords)
  tail.matrix.translate(0.05, 0, 0.14);
  tail.matrix.rotate(45, 1, 0, 0);
  tail.matrix.scale(0.25, 0.2, 0.3);
  tail.render();

  // left ear
  var leftEar = new Cube();
  leftEar.color = [0.25, 0.25, 0.25, 1.0];
  leftEar.matrix = new Matrix4(headCoords);
  leftEar.matrix.translate(-0.05, -0.04, 0.025);
  leftEar.matrix.rotate(-45, 0, 0, 1)
  leftEar.matrix.scale(0.2, 0.06, 0.2);
  leftEar.render();
  
  // right ear
  var rightEar = new Cube();
  rightEar.color = [0.25, 0.25, 0.25, 1.0];
  rightEar.matrix = new Matrix4(headCoords);
  rightEar.matrix.translate(-0.2, -0.04, 0.025);
  rightEar.matrix.scale(-1, 1, 1);
  rightEar.matrix.rotate(-45, 0, 0, 1)
  rightEar.matrix.scale(0.2, 0.06, 0.2);
  rightEar.render();
  
  // left eyelid
  var leftEyelid = new Cube();
  leftEyelid.color = [0.749, 0.651, 0.694, 1.0];
  leftEyelid.matrix = new Matrix4(headCoords);
  leftEyelid.matrix.translate(-0.11, -0.07, -0.01);
  leftEyelid.matrix.scale(0.08, 0.03, 0.08);
  leftEyelid.render();

  // right eyelid
  var rightEyelid = new Cube();
  rightEyelid.color = [0.749, 0.651, 0.694, 1.0];
  rightEyelid.matrix = new Matrix4(headCoords);
  rightEyelid.matrix.translate(-0.22, -0.07, -0.01);
  rightEyelid.matrix.scale(0.08, 0.03, 0.08);
  rightEyelid.render();

  // left eye
  var leftEye = new Cube();
  leftEye.color = [1.0, 1.0, 1.0, 1.0];
  leftEye.matrix = new Matrix4(headCoords);
  leftEye.matrix.translate(-0.105, -0.13, -0.005);
  leftEye.matrix.scale(0.07, 0.07, 0.07);
  leftEye.render();

  // right eye
  var rightEye = new Cube();
  rightEye.color = [1.0, 1.0, 1.0, 1.0];
  rightEye.matrix = new Matrix4(headCoords);
  rightEye.matrix.translate(-0.215, -0.13, -0.005);
  rightEye.matrix.scale(0.07, 0.07, 0.07);
  rightEye.render();

  // left pupil
  var leftPupil = new Cube();
  leftPupil.color = [0.0, 0.0, 0.0, 1.0];
  leftPupil.matrix = new Matrix4(headCoords);
  leftPupil.matrix.translate(-0.09, -0.125, -0.009);
  leftPupil.matrix.scale(0.04, 0.04, 0.04);
  leftPupil.render();

  // right pupil
  var rightPupil = new Cube();
  rightPupil.color = [0.0, 0.0, 0.0, 1.0];
  rightPupil.matrix = new Matrix4(headCoords);
  rightPupil.matrix.translate(-0.2, -0.125, -0.009);
  rightPupil.matrix.scale(0.04, 0.04, 0.04);
  rightPupil.render();

  // left nostril
  var leftNostril = new Cube();
  leftNostril.color = [0.18, 0.18, 0.18, 1.0];
  leftNostril.matrix = new Matrix4(headCoords);
  leftNostril.matrix.translate(-0.1, -0.26, -0.01);
  leftNostril.matrix.scale(0.04, 0.04, 0.04);
  leftNostril.render();

  // right nostril
  var rightNostril = new Cube();
  rightNostril.color = [0.18, 0.18, 0.18, 1.0];
  rightNostril.matrix = new Matrix4(headCoords);
  rightNostril.matrix.translate(-0.19, -0.26, -0.01);
  rightNostril.matrix.scale(0.04, 0.04, 0.04);
  rightNostril.render();
  
  // Check the time at the end of this function and show on webpage
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function renderBabySheep(x, y, z, rotateVal) {
  // body
  var body = new Cube();
  body.color = [1.0, 1.0, 1.0, 1.0];
  body.matrix.translate(x, y, z);
  body.matrix.rotate(rotateVal, 0, 1, 0);
  var bodyCoords = new Matrix4(body.matrix);
  body.matrix.scale(0.25, 0.25, 0.3);
  body.render();

  // head
  var head = new Cube();
  head.color = [0.25, 0.25, 0.25, 1.0];
  head.matrix = new Matrix4(bodyCoords);
  head.matrix.translate(0.05, 0.03, -0.15);
  var headCoords = new Matrix4(head.matrix)
  head.matrix.scale(0.15, 0.15, 0.15);
  head.render();

  // leg1
  var leg1 = new Cube();
  leg1.color = [0.25, 0.25, 0.25, 1.0];
  leg1.matrix = new Matrix4(bodyCoords);
  leg1.matrix.translate(0.15, -0.1, 0.02);
  leg1.matrix.scale(0.08, 0.11, 0.08);
  leg1.render();

  // leg2
  var leg2 = new Cube();
  leg2.color = [0.25, 0.25, 0.25, 1.0];
  leg2.matrix = new Matrix4(bodyCoords);
  leg2.matrix.translate(0.02, -0.1, 0.02);
  leg2.matrix.scale(0.08, 0.11, 0.08);
  leg2.render();

  // leg3
  var leg3 = new Cube();
  leg3.color = [0.25, 0.25, 0.25, 1.0];
  leg3.matrix = new Matrix4(bodyCoords);
  leg3.matrix.translate(0.15, -0.1, 0.2);
  leg3.matrix.scale(0.08, 0.11, 0.08);
  leg3.render();

  // leg4
  var leg4 = new Cube();
  leg4.color = [0.25, 0.25, 0.25, 1.0];
  leg4.matrix = new Matrix4(bodyCoords);
  leg4.matrix.translate(0.02, -0.1, 0.2);
  leg4.matrix.scale(0.08, 0.11, 0.08);
  leg4.render();

  // tail
  var tail = new Cube();
  tail.color = [1.0, 1.0, 1.0, 1.0];
  tail.matrix = new Matrix4(bodyCoords)
  tail.matrix.translate(0.045, 0.12, 0.23);
  tail.matrix.rotate(45, 1, 0, 0);
  tail.matrix.scale(0.15, 0.1, 0.15);
  tail.render();

  // left ear
  var leftEar = new Cube();
  leftEar.color = [0.25, 0.25, 0.25, 1.0];
  leftEar.matrix = new Matrix4(headCoords);
  leftEar.matrix.translate(0.13, 0.1, 0.025);
  leftEar.matrix.rotate(-45, 0, 0, 1)
  leftEar.matrix.scale(0.1, 0.03, 0.1);
  leftEar.render();
  
  // right ear
  var rightEar = new Cube();
  rightEar.color = [0.25, 0.25, 0.25, 1.0];
  rightEar.matrix = new Matrix4(headCoords);
  rightEar.matrix.translate(0.025, 0.1, 0.025);
  rightEar.matrix.scale(-1, 1, 1);
  rightEar.matrix.rotate(-45, 0, 0, 1)
  rightEar.matrix.scale(0.1, 0.03, 0.1);
  rightEar.render();
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
