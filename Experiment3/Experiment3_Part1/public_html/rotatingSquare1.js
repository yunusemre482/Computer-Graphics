"use strict";

var canvas;
var gl;
var colorArray = Array(12).fill((0-1));//fill array
var theta = 0.0;
var thetaLoc;

var speed = 0.1,// initislize variables
  program,
  toggle = -1;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //
  //  Configure WebGL
  //
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vertices = [vec2(0*1.4, 0.5*1.4), vec2(-0.433*1.4, -0.25*1.4), vec2(0.433*1.4, -0.25*1.4)];//set verticies as multiplied by 1.4 for scale it 

  bufferOp();
  // Load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);


  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, "theta");

  render();
};

function render() {
     

    bufferOp();//call buffer Operation function 
    theta+=(-toggle*speed);//change direction of shape

    gl.uniform1f( thetaLoc, theta );
    gl.drawArrays( gl.LINE_LOOP, 0, 3 );

    window.requestAnimFrame(render);//render frame again and again
}

function clickEvent(clickID) {
  switch (clickID) {
    case "toggle-button":
      toggle *= -1;//change direction of shape
      break;
    case "speed-button":
      speed += 0.015;//increase speed of shape
      break;
    case "slow-button":
      speed =(speed <= 0) ? 0 :speed-=0.015;
      break;
    case "color-button":
      colorArray =Array(12).fill().map(() =>Math.random(0-1));//change color of shape
      console.log(colorArray);
      break;
  }
}

function bufferOp(){

    gl.clear( gl.COLOR_BUFFER_BIT );
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW );

    var vecColor = gl.getAttribLocation( program, "vecColor" );//call declared variable as vector color
    gl.vertexAttribPointer( vecColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vecColor );
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );

}