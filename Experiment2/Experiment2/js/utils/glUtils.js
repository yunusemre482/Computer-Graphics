(function (global) {
  var glUtils = {
    checkWebGL: (canvas) => {
      var gl = canvas.getContext("webgl2");

      if (!gl) {
        alert(
          "WebGL not available, sorry! Please use a new version of Chrome or Firefox."
        );
      }
      return gl;
    },

    createProgram: (gl, vertexShader, fragmentShader) => {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(program);
        console.log("Failed to link program: " + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
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
})(window || this);
