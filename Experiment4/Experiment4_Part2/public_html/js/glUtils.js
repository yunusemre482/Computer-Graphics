(function (global) {
  const radian = Math.PI / 180;
  var monkey_verticies = [];//data of monkey monkey_verticies
  var monkey_head = [];//data of monkey head object as array
  var rotateStep = 0.0;
  var numOfComponents = 3; // x, y and z (3d)
  var offset = 0;
  var normalize = false;
  var stride = 0;
  var rotation_of_theta = 0.0;
  var rotateStep = 1.0;
  var at = vec3(0.0, 0.0, 0.0);
  var up = vec3(0.0, 1.0, 0.0);
  var eye;
  var phi = -9.5;
  var theta = -2.0;
  var projectionMatrix;
  var modelViewMatrix;
  var near = 0.3;
  var far = 80.0;
  var radius = 8.0;
  var fovy = 45.0;
  var surfaceVertex = [
    vec3(-10.0, -5.0, 10.0),
    vec3(-10.0, -5.0, -10.0),
    vec3(10.0, -5.0, -10.0),
    vec3(10.0, -5.0, -10.0),
    vec3(10.0, -5.0, 10.0),
    vec3(-10.0, -5.0, 10.0),
  ];
  var aspect = 1.0;

  var cameraTranslation = vec3(5.0, 4.0, 5.0);

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
        gl.deleteProgram(program); //delete shader program
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader); //create vertex shader from script
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
    drawScene: (gl, canvas, vertexShader, monkeyShader, surfaceShader) => {
      var type = gl.FLOAT;
      const monkey_headShader = glUtils.createProgram(
        gl,
        vertexShader,
        monkeyShader
      );
      const monkey_headBuffer = gl.createBuffer();
      gl.enableVertexAttribArray(
        gl.getAttribLocation(monkey_headShader, "a_position")
      );
      var shaderrotation_of_theta = gl.getUniformLocation(
        monkey_headShader,
        "u_rotate_theta"
      );
      var shaderModelView = gl.getUniformLocation(monkey_headShader, "u_model_view");
      var shaderProjection = gl.getUniformLocation(
        monkey_headShader,
        "u_projection"
      );

      const planeShader = glUtils.createProgram(
        gl,
        vertexShader,
        surfaceShader
      );
      const planeBuffer = gl.createBuffer();
      gl.enableVertexAttribArray(
        gl.getAttribLocation(planeShader, "a_position")
      );
      var planeTheta = gl.getUniformLocation(planeShader, "u_rotate_theta");//vertex shader information replacement
      var planeModelView = gl.getUniformLocation(planeShader, "u_model_view");//vertex shader information replacement
      var planeProjection = gl.getUniformLocation(planeShader, "u_projection");//vertex shader information replacement

      canvas.height = $(window).height();
      canvas.width = $(window).width();
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = canvas.width / canvas.height;

      rotation_of_theta += rotateStep;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // calculate vectors and matrices
      eye = vec3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
      );
      eye = add(eye, cameraTranslation);
      modelViewMatrix = lookAt(eye, at, up);
      projectionMatrix = perspective(fovy, aspect, near, far);

      // monkey_head
      gl.bindBuffer(gl.ARRAY_BUFFER, monkey_headBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(monkey_verticies), gl.STATIC_DRAW);

      // onkey_positions
      gl.vertexAttribPointer(
        gl.getAttribLocation(monkey_headShader, "a_position"),
        numOfComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.useProgram(monkey_headShader);
        
      var spinCos=Math.cos(rotation_of_theta*radian);
      var spinSin=Math.sin(rotation_of_theta*radian);
      var rotation_matrix = gl.getUniformLocation(monkey_headShader, "rotation_matrix");
      var rotationMatrix = new Float32Array([
        spinCos,
        0,
        -spinSin,
        0.0,

        0.0,
        1.0,
        0.0,
        0.0,

        spinSin,
        0.0,
        spinCos,
        0.0,

        0.0,
        0.0,
        0.0,
        1.0

      ]);
      gl.uniformMatrix4fv(rotation_matrix, false,rotationMatrix);

      // buffers of monkey_head
      gl.uniform1f(shaderrotation_of_theta, rotation_of_theta);
      gl.uniformMatrix4fv(shaderModelView, false, flatten(modelViewMatrix));
      gl.uniformMatrix4fv(shaderProjection, false, flatten(projectionMatrix));

      // DRAW Monkey head object
      gl.drawArrays(gl.TRIANGLES, offset, monkey_verticies.length);

      // surface 
      gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(surfaceVertex), gl.STATIC_DRAW);

      // Surface POSITIONS
      gl.vertexAttribPointer(
        gl.getAttribLocation(planeShader, "a_position"),
        numOfComponents,
        type,
        normalize,
        stride,
        offset
      );
      
      gl.useProgram(planeShader);
      var spinCos=Math.cos(0);
      var spinSin=Math.sin(0);
      var rotation_matrix = gl.getUniformLocation(planeShader, "rotation_matrix");
      var rotationMatrix = new Float32Array([
        spinCos,
        0,
        -spinSin,
        0.0,

        0.0,
        1.0,
        0.0,
        0.0,

        spinSin,
        0.0,
        spinCos,
        0.0,

        0.0,
        0.0,
        0.0,
        1.0

      ]);
      gl.uniformMatrix4fv(rotation_matrix, false,rotationMatrix);
      // Surface uniforms and matrix 
      gl.uniformMatrix4fv(planeModelView, false, flatten(modelViewMatrix));
      gl.uniformMatrix4fv(planeProjection, false, flatten(projectionMatrix));

      // DRAW PLANE
      gl.drawArrays(gl.TRIANGLES, 0, surfaceVertex.length);

      window.requestAnimationFrame(function() {
        drawUtils.drawScene(gl, canvas, vertexShader, monkeyShader, surfaceShader);
    });
    },
    updatePosition: (e) => {
      phi += (e.movementX * radian);
      theta += (e.movementY * radian);
    },
    readMonkeyHead: async (
      callback,
      gl,
      canvas,
      vertexShader,
      monkeyShader,
      surfaceShader
    ) => {
      await $.get(
        "./js/monkey_head.obj",
        function (data) {
          var lines = data.split("\n");

          $.each(lines, function (n, elem) {
            var res = elem.split(" ");
            if (res[0] == "v") {
              monkey_head.push(
                vec3(parseFloat(res[1]), parseFloat(res[2]), parseFloat(res[3]))
              );
            } else if (res[0] == "f") {
              monkey_verticies.push(monkey_head[parseInt(res[1]) - 1]);
              monkey_verticies.push(monkey_head[parseInt(res[2]) - 1]);
              monkey_verticies.push(monkey_head[parseInt(res[3]) - 1]);
            }
          });
        },
        "text"
      );
      callback(gl, canvas, vertexShader, monkeyShader, surfaceShader);
    },
    clickEvent: (clickID,canvas) => {
      switch (clickID) {
        // speed up key
        case 107:
          rotateStep += 1.0;
          break;
        // speed down key
        case 109:
          rotateStep -= 1.0;
          break;
        // up side arrow
        case 38:
          at[2] -= 0.1;
          cameraTranslation[2] -= 0.1;
          break;
        // down side arrow
        case 40:
          at[2] += 0.1;
          cameraTranslation[2] += 0.1;
          break;
        // right side arrow
        case 39:
          at[0] += 0.1;
          cameraTranslation[0] += 0.1;
          break;
        // left side arrow
        case 37:
          at[0] -= 0.1;
          cameraTranslation[0] -= 0.1;
          break;
        // page up key
        case 33:
          at[1] += 0.1;
          cameraTranslation[1] += 0.1;
          break;
        // page down key
        case 34:
          at[1] -= 0.1;
          cameraTranslation[1] -= 0.1;
          break;
        // camera lock-unlock key
        case 69:
          if (
            document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas
          ) {
            // unlock camera for mouse
            document.exitPointerLock =
              document.exitPointerLock || document.mozExitPointerLock;
            document.exitPointerLock();
            document.removeEventListener(
              "mousemove",
              drawUtils.updatePosition,
              false
            );
          } else {
            // lock camera for mouse
            canvas.requestPointerLock =
              canvas.requestPointerLock || canvas.mozRequestPointerLock;
            canvas.requestPointerLock();
            document.addEventListener(
              "mousemove",
              drawUtils.updatePosition,
              false
            );
          }
          break;
        default:
          break;
      }
    },
  };
  global.drawUtils = drawUtils;
})(window || this);
