/* global vertex_shader , fragment_shader , square, small_circles, circle_color, square_color*/
const main = () => {
  // Get canvas element and check if WebGL enabled
  var canvas = document.getElementById("myCanvas");
  var gl = glUtils.checkWebGL(canvas);
  const color_yellow = [1.0, 1.0, 0.0];
  const color_black = [0.0, 0.0, 0.0];
  const color_mask = [0.839, 0.878, 0.922];
  var vertexShader = glUtils.createShader(gl, gl.VERTEX_SHADER, vertex_shader),
    fragmentShader = glUtils.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragment_shader
    );

  const program = glUtils.createProgram(gl, vertexShader, fragmentShader);

  const mask_line_positions = [
    [-1, 0.05, -0.6, -0.05, -1, -0.05, -0.6, -0.15], //Left-Up String
    [1, 0.05, 0.6, -0.05, 1, -0.05, 0.6, -0.15], //Right-Up String
    [-0.682, -0.73, -0.6, -0.7, -0.742, -0.67, -0.6, -0.62], //Left-Down String
    [0.682, -0.73, 0.6, -0.7, 0.742, -0.67, 0.6, -0.62], //Right-Down String
  ];

  const mask_position = [-0.6, -0.05, 0.6, -0.05, -0.6, -0.7, 0.6, -0.7];

  gl.useProgram(program);
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // green background
  gl.clear(gl.COLOR_BUFFER_BIT);
  var mask_color = [];
  for (var i = 0; i < 4; i++) {
    mask_color = mask_color.concat(color_mask);
  }

  //Color array for Strings of Mask
  var strings_of_mask_color = [];
  for (var i = 0; i < 4; i++) {
    strings_of_mask_color = strings_of_mask_color.concat(color_mask);
  }
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

  const buffer_square2 = drawUtils.Buffer(gl, mask_position, color_mask);

  var buffer_square = [];
  for (var i = 0; i < 4; i++) {
    buffer_square = buffer_square.concat(
      drawUtils.Buffer(gl, mask_line_positions[i], color_mask)
    );
  }

  drawUtils.drawShape(
    program,
    gl,
    big_circle,
    big_circle_buffers[0],
    gl.TRIANGLE_FAN,
    360
  );
  drawUtils.drawShape(
    program,
    gl,
    rightEye,
    rightEye_buffers[0],
    gl.TRIANGLE_FAN,
    360
  );
  drawUtils.drawShape(
    program,
    gl,
    leftEye,
    leftEye_buffers[0],
    gl.TRIANGLE_FAN,
    360
  );
  for (var i = 0; i < 4; i++) {
    drawUtils.drawShape(
      program,
      gl,
      mask_line_positions[i],
      buffer_square[i],
      gl.TRIANGLE_STRIP,
      4
    );
  }
};
