(function (global) {
  const radian = Math.PI / 180;

  var rotation_angle = 0; // Rotating angle per one Rotate Animation
  var gValue = 0;
  var translationComp = 0.0;
  var startSpin = false,
    startScale = false,
    startSpiral = false;
  var scaleOver = true;
  var spiralSpeed = 0,
    spiralAngle = 0,
    spinAngles = 0,
    spinSpeed = 0;
  var scale = 0.40;

  var glUtils = {
    checkWebGL: (canvas) => {
      var gl = canvas.getContext("webgl2");
      gl.viewport(0, 0, canvas.width, canvas.height);

      if (!gl) {
        alert(
          "WebGL not available, sorry! Please use a new version of Chrome or Firefox."
        );
      }
      return gl;
    },
    resizeCanvasToDisplaySize: (canvas, multiplier) => {
      multiplier = multiplier || 1;
      const width = (canvas.clientWidth * multiplier) | 0;
      const height = (canvas.clientHeight * multiplier) | 0;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    },
    createProgram: (gl, vertexShader, fragmentShader) => {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(program);
        console.log("Failed to link program: " + error);
        gl.deleteProgram(program);//delete shader program
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);//create vertex shader from script
        return null;
      }

      return program;
    },

    createShader: function (gl, shaderType, shaderSource) {
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
          "Could not compile " +
            shaderType +
            "shader:" +
            gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
  };

  global.glUtils = glUtils;

  var drawUtils = {
    drawCircle: (gl, centerX, centerY, radius, color) => {
      var circle_color = [];
      var circle = [];
      var buffers = [];

      for (var j = 0; j < 360; j++) {
        circle = circle.concat([
          radius * Math.cos(j * radian) + centerX,
          radius * Math.sin(j * radian) + centerY,
        ]);
        circle_color = circle_color.concat(color);
      }

      buffers = buffers.concat(drawUtils.Buffer(gl, circle, circle_color));
      return [circle, buffers];
    },
    drawRectangle: (program, gl, positions, color) => {
      var rec_color = [];
      for (var i = 0; i < positions.length; i++) {
        rec_color = rec_color.concat(color);
      }
      var buffers = [];
      for (var i = 0; i < positions.length; i++) {
        buffers = buffers.concat(drawUtils.Buffer(gl, positions[i], rec_color));

        drawUtils.drawShape(
          program,
          gl,
          positions[i],
          buffers[i],
          gl.TRIANGLE_STRIP,
          4,
          1
        );
      }
    },
    drawCurve: (program, gl, points, color) => {
      var curve_color = [];
      for (var i = 0; i < 2000; i++) {
        curve_color = curve_color.concat(color);
      }

      var curve_positions = [[], []]; //Positions array of Curved Shape
      //Calculation loop of points of Curved Shape for Mask
      for (var t = 0; t < 1; t = t + 0.0005) {
        var P = drawUtils.quadraticBezier(points.p0, points.p1, points.p2, t);
        curve_positions[0] = curve_positions[0].concat([P.x, P.y]);
      }

      var buffers = [];
      for (var i = 0; i < 2; i++) {
        buffers = buffers.concat(
          drawUtils.Buffer(gl, curve_positions[i], curve_color)
        );
      }
      //Loop for drawing the two Curved Shape for Mask
      for (var i = 0; i < 1; i++) {
        drawUtils.drawShape(
          program,
          gl,
          curve_positions[i],
          buffers[i],
          gl.TRIANGLE_FAN,
          2000,
          1
        );
      }
    },
    drawMaskCenter: (program, gl, positions, color) => {
      var rec_color = [];
      for (var i = 0; i < positions.length; i++) {
        rec_color = rec_color.concat(color);
      }
      const buffers = drawUtils.Buffer(gl, positions, rec_color); //fill the buffer with rewuired data
      drawUtils.drawShape(
        program,
        gl,
        positions,
        buffers,
        gl.TRIANGLE_STRIP,
        4,
        1
      );
    },
    Buffer: (gl, shape, shape_color) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(shape.concat(shape_color)),
        gl.STATIC_DRAW
      );
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(shape));
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        shape.length * 4,
        new Float32Array(shape_color)
      );
      return buffer;
    },
    quadraticBezier: (p0, p1, p2, t) => {
      var P = {};
      P.x = Math.pow(1 - t, 2) * p0.x + (1 - t) * 2 * t * p1.x + t * t * p2.x;//position of mask lines
      P.y = Math.pow(1 - t, 2) * p0.y + (1 - t) * 2 * t * p1.y + t * t * p2.y;//position of mask lines
      return P;
    },
    drawShape: (
      program,
      gl,
      shape,
      shape_buffer,
      shape_mode,
      vertex_number,
      id
    ) => {
      const numComponents = 2; // pull out 2 values per iteration
      const type = gl.FLOAT; // the data in the buffer is 32bit floats
      const normalize = false; // don't normalize
      const stride = 0; // how many bytes to get from one set of values to the next
      // 0 = use type and numComponents above
      const offset = 0; // how many bytes inside the buffer to start from


      var scaleMatrix = gl.getUniformLocation(program, "scale_matrix");
      var formMatrix = new Float32Array([
        scale,
        0.0,
        0.0,
        0.0,

        0.0,
        scale,
        0.0,
        0.0,

        0.0,
        0.0,
        scale,
        0.0,

        0.0,
        0.0,
        0.0,
        1.0

      ]);
      gl.uniformMatrix4fv(scaleMatrix, false,formMatrix);

      var vertex_location = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(vertex_location);

      var spinCos=Math.cos(spinAngles*radian);
      var spinSin=Math.sin(spinAngles*radian);
      var rotation_matrix = gl.getUniformLocation(program, "rotation_matrix");//rotation matrix for spin animation
      var rotationMatrix = new Float32Array([
        spinCos,
        spinSin,
        0.0,
        0.0,

        -spinSin,
        spinCos,
        0.0,
        0.0,

        0.0,
        0.0,
        1.0,
        0.0,

        0.0,
        0.0,
        0.0,
        1.0

      ]);
      gl.uniformMatrix4fv(rotation_matrix, false,rotationMatrix);

      var color_location = gl.getAttribLocation(program, "a_color"); //get the color position
      var transMatrix = gl.getUniformLocation(program, "transformatiom_matrix");
      var transformMatrix = new Float32Array([
        1.0,
        0.0,
        0.0,
        0.0,

        0.0,
        1.0,
        0.0,
        0.0,

        0.0,
        0.0,
        1.0,
        0.0,

        translationComp * Math.cos(radian*spiralAngle),
        translationComp * Math.sin(radian*spiralAngle),
        0.0,
        1.0

      ]);
      gl.uniformMatrix4fv(transMatrix, false,transformMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, shape_buffer);
      gl.vertexAttribPointer(
        vertex_location,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(vertex_location);
      gl.enableVertexAttribArray(color_location);

      gl.vertexAttribPointer(
        color_location,
        3,
        type,
        normalize,
        stride,
        shape.length * 4
      );
      gl.drawArrays(shape_mode, offset, vertex_number);
    },
    render: () => {
      if (startSpin) {
          spinAngles += spinSpeed;
      }

      if (startScale) {

        if (scale >= 0.375) {
          scaleOver = false;
        } else if (scale <= 0.125) {
          scaleOver = true;
        }
        if (scaleOver) {
          scale += 0.0025;
        } else {
          scale -= 0.0025;
        }
      }
      if (startSpiral) {
        if (spiralSpeed < 0 && spiralAngle >= 450) {
          spiralAngle -= 900;
        } else if (spiralSpeed > 0 && spiralAngle <= -450) {
          spiralAngle += 900;
        }
        spiralAngle -= spiralSpeed;
        translationComp = spiralAngle / -1080;
      }
    },
    clickEvent: (clickID) => {
      switch (clickID) {
        case "startSpin":
          startSpin = true;
          spinSpeed = parseInt(document.getElementById("speedSpin").value);
          break;
        case "stopSpin":
          startSpin = false;
          break;
        case "startScale":
          startScale = true;
          break;
        case "stopScale":
          startScale = false;
          break;
        case "startSpiral":
          startSpiral = true;
          spiralSpeed = parseInt(document.getElementById("speedSpiral").value);
          break;
        case "stopSpiral":
          startSpiral = false;
          break;
        case "speedSpin":
          startSpin = true;
          spinSpeed = parseInt(document.getElementById("speedSpin").value);
          break;
        case "speedSpiral":
          startSpiral = true;
          spiralSpeed = parseInt(document.getElementById("speedSpiral").value);
          break;
      }
    },
  };
  global.drawUtils = drawUtils;
})(window || this);
