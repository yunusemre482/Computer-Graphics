/* global vertex_shader , fragment_shader , square, small_circles, circle_color, square_color*/
const main = (global) => {
  // Get canvas element and check if WebGL enabled
  var canvas = document.getElementById("myCanvas");
  var gl = glUtils.checkWebGL(canvas);
  const color_yellow = [1.0, 1.0, 0.0];
  const color_black = [0.0, 0.0, 0.0];
  const color_white = [1.0, 0.0, 0.0];

  const color_mask = [0.839, 0.878, 0.922];
  var vertexShader = glUtils.createShader(gl, gl.VERTEX_SHADER, vertex_shader),
    fragmentShader = glUtils.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragment_shader
    );

  const program = glUtils.createProgram(gl, vertexShader, fragmentShader);

  const positions = [
    [-1, 0.05, -0.6, -0.05, -1, -0.05, -0.6, -0.15], //Left-Up String
    [1, 0.05, 0.6, -0.05, 1, -0.05, 0.6, -0.15], //Right-Up String
    [-0.682, -0.73, -0.6, -0.7, -0.742, -0.67, -0.6, -0.62], //Left-Down String
    [0.682, -0.73, 0.6, -0.7, 0.742, -0.67, 0.6, -0.62], //Right-Down String
  ];

  const mask_position = [-0.6, -0.05, 0.6, -0.05, -0.6, -0.7, 0.6, -0.7];

  const UpCUrve = {
    p0: {
      x: -0.62,
      y: -0.09,
    },
    p2: {
      x: 0.62,
      y: -0.09,
    },
    p1: {
      x: 0.0,
      y: 0.35,
    },
  };

  const downVurve = {
    p0: {
      x: -0.62,
      y: -0.7,
    },
    p2: {
      x: 0.62,
      y: -0.7,
    },
    p1: {
      x: 0,
      y: -0.99,
    },
  };

  gl.useProgram(program);
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // green background
  gl.clear(gl.COLOR_BUFFER_BIT);

  var [big_circle, big_circle_buffers] = drawUtils.drawCircle(
    gl,
    0.0,
    0.0,
    1,
    color_yellow
  );
  var [rightEye, rightEye_buffers] = drawUtils.drawCircle(
    gl,
    0.36,
    0.35,
    0.16,
    color_black
  );
  var [leftEye, leftEye_buffers] = drawUtils.drawCircle(
    gl,
    -0.36,
    0.35,
    0.16,
    color_black
  );
  
  drawScene();


  function drawScene() {
    drawUtils.render();
    glUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // green background
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawUtils.drawShape(
      program,
      gl,
      big_circle,
      big_circle_buffers[0],
      gl.TRIANGLE_FAN,
      360,
      0
    );
    drawUtils.drawShape(
      program,
      gl,
      rightEye,
      rightEye_buffers[0],
      gl.TRIANGLE_FAN,
      360,
      1
    );
    drawUtils.drawShape(
      program,
      gl,
      leftEye,
      leftEye_buffers[0],
      gl.TRIANGLE_FAN,
      360,
      1
    );

    drawUtils.drawRectangle(program, gl, positions, color_mask, 1);
    drawUtils.drawMaskCenter(program, gl, mask_position, color_mask, 1);
    drawUtils.drawCurve(program, gl, UpCUrve, color_mask, 1);
    drawUtils.drawCurve(program, gl, downVurve, color_mask, 1);
    requestAnimationFrame(drawScene)
  }
};
