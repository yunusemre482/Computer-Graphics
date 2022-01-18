(function (global) {
  const radian = Math.PI / 180;
  const numComponents = 2; // pull out 2 values per iteration
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  const offset = 0; // how many bytes inside the buffer to start from

  var drawUtils = {
    drawCircle: (gl,centerX, centerY, radius, color) => {
      var circle_color = [];
      var circle = [];
      var buffers = [];
      
      for (var j = 0; j < 360; j++) {
        circle = circle.concat([
          radius * Math.cos(j * radian) + centerX,
          radius * Math.sin(j * radian) + centerY,
        ]);
        circle_color = circle_color.concat(color);
      };

      buffers= buffers.concat(
        drawUtils.Buffer(gl, circle, circle_color)
      );
      return [circle, buffers];
    },
    drawRectangle: (gl,positions,color) => {
        var lines = [];
        var strings_of_mask_color = [];
        var buffer_of_mask_lines=[]

        for(var i = 0;i<4;i++){
            
            lines = lines.concat(drawUtils.Buffer(gl,positions[i],color));
            buffer_of_mask_lines = buffer_of_mask_lines.concat(drawUtils.Buffer(gl,positions[i],color));
            strings_of_mask_color = strings_of_mask_color.concat(color);
        }
        return [lines,strings_of_mask_color];
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
    drawShape: (program,gl, shape, shape_buffer, shape_mode, vertex_number) => {
      const numComponents = 2; // pull out 2 values per iteration
      const type = gl.FLOAT; // the data in the buffer is 32bit floats
      const normalize = false; // don't normalize
      const stride = 0; // how many bytes to get from one set of values to the next
      // 0 = use type and numComponents above
      const offset = 0; // how many bytes inside the buffer to start from

      const vertex_location = gl.getAttribLocation(program, "a_position"); //get the vertex position
      const color_location = gl.getAttribLocation(program, "a_color"); //get the color position

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
  };

  global.drawUtils = drawUtils;
})(window || this);