(function (global) {
  const radian = Math.PI / 180;
  var direction = 0; // Rotation Direction of Shape(if 0 --> Left ; if 1 --> Right);
  var rotation_angle = 0; // Rotating angle per one Rotate Animation
  var gValue = 0;
  var isAnimate = false; // For Animation Control boolean for Step2 and Step3
  var color_change = false;
  var scale = [0.4, 0.4];

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
      const buffers = drawUtils.Buffer(gl, positions, rec_color);
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
      P.x = Math.pow(1 - t, 2) * p0.x + (1 - t) * 2 * t * p1.x + t * t * p2.x;
      P.y = Math.pow(1 - t, 2) * p0.y + (1 - t) * 2 * t * p1.y + t * t * p2.y;
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

      var vertex_location = gl.getAttribLocation(program, "a_position"); //get the vertex position
      var scaleLocation = gl.getUniformLocation(program, "u_scale");
      var transformation_matrix = gl.getUniformLocation(
        program,
        "transformation_matrix"
      ); //get the transformation matrix of shape's coordinates
      var color_g = gl.getUniformLocation(program, "color_g"); // get the color value
      var shape_id = gl.getUniformLocation(program, "shape_id"); // get the shape id
      var color_location = gl.getAttribLocation(program, "a_color"); //get the color position

      var radianTransformation = (Math.PI * rotation_angle) / 180; //Transformation value calculation
      var cosB = Math.cos(radianTransformation); //Cos of transformation value
      var sinB = Math.sin(radianTransformation); //Sin of transformation value
      var t_matrix = new Float32Array([
        cosB,
        +sinB,
        0,
        0,
        -sinB,
        cosB,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
      ]); // Array of transformation

      gl.uniform1f(color_g, gValue); // Pas the color changing value

      gl.uniformMatrix4fv(transformation_matrix, false, t_matrix);
      gl.uniform2fv(scaleLocation, scale);
      gl.uniform1i(shape_id, id); //Pass Shape Id Value
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
    keyMaps: (value) => {
      direction = 0; // Rotation Direction of Shape(if 0 --> Left ; if 1 --> Right);
      rotation_angle = 0; // Rotating angle per one Rotate Animation
      gValue = 0;
      switch (parseInt(value)) {
        case 1: //
          isAnimate = false;
          color_change = false;
          break;
        case 2: //
          isAnimate = true;
          color_change = false;
          break;
        case 3: //
          isAnimate = true;
          color_change = true;
          break;
      }
    },

    render: () => {
      if (isAnimate) {
        if (rotation_angle < 45 && !direction) {
          direction = 0;
          rotation_angle += 1.1;
        } else if (rotation_angle >= 45 && !direction) {
          direction = 1;
          rotation_angle -= 1.1;
        } else if (rotation_angle > -45 && direction) {
          direction = 1;
          rotation_angle -= 1.1;
        } else if (rotation_angle <= -45 && direction) {
          direction = 0;
          rotation_angle += 1.1;
        }
        if (color_change == true) {
          if (rotation_angle === 0) {
            gValue = 0;
          } else if (rotation_angle >= 0 && !direction) {
            gValue -= 0.0053;
          } else if (rotation_angle < 0 && !direction ) {
            gValue += 0.0053;
          } else if (rotation_angle > 0 && direction) {
            gValue += 0.0053;
          } else if (rotation_angle <= 0 && direction) {
            gValue -= 0.0053;
          }
        }
      }
    },
  };
  global.drawUtils = drawUtils;
})(window || this);
