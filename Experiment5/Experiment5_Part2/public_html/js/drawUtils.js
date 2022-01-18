(function (global) {
    const radian = Math.PI / 180;


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
        configureTexture: (program, image, i) => {
            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.uniform1i(gl.getUniformLocation(program, "texture2d"), 0);

        },
        configureTexture1: (program, image) => {
            texture1 = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1 + 0);
            gl.bindTexture(gl.TEXTURE_2D, texture1);
            // Fill the texture with a 1x1 blue pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl
                .UNSIGNED_BYTE, new Uint8Array([0, 255, 255, 255]));
            gl.bindTexture(gl.TEXTURE_2D, texture1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl
                .UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    };

    global.glUtils = glUtils;

    var drawUtils = {
        getCubeVertex: (index, i, j) => {
            switch (index) {
                case 0:
                    return vec3(0.035 + 3.5 * i, 0.035 + 3.5 * j, 0.0);
                    break;
                case 1:
                    return vec3(-0.035 + 3.5 * i, 0.035 + 3.5 * j, 0.0);
                    break;
                case 2:
                    return vec3(-0.035 + 3.5 * i, 0.035 + 3.5 * j, 0.070);
                    break;
                case 3:
                    return vec3(0.035 + 3.5 * i, 0.035 + 3.5 * j, 0.070);
                    break;
                case 4:
                    return vec3(-0.035 + 3.5 * i, -0.035 + 3.5 * j, 0.0);
                    break;
                case 5:
                    return vec3(-0.035 + 3.5 * i, -0.035 + 3.5 * j, 0.070);
                    break;
                case 6:
                    return vec3(0.035 + 3.5 * i, -0.035 + 3.5 * j, 0.0);
                    break;
                case 7:
                    return vec3(0.035 + 3.5 * i, -0.035 + 3.5 * j, 0.070);
                    break;
            }
        },
        createCube: (i, j) => {
            var side1 = [
                drawUtils.getCubeVertex(0, i, j),
                drawUtils.getCubeVertex(1, i, j),
                drawUtils.getCubeVertex(2, i, j),
                drawUtils.getCubeVertex(3, i, j),
            ];
            var side2 = [
                drawUtils.getCubeVertex(1, i, j),
                drawUtils.getCubeVertex(4, i, j),
                drawUtils.getCubeVertex(5, i, j),
                drawUtils.getCubeVertex(1, i, j),
            ];
            var side3 = [
                drawUtils.getCubeVertex(4, i, j),
                drawUtils.getCubeVertex(6, i, j),
                drawUtils.getCubeVertex(7, i, j),
                drawUtils.getCubeVertex(5, i, j),
            ];
            var side4 = [
                drawUtils.getCubeVertex(6, i, j),
                drawUtils.getCubeVertex(0, i, j),
                drawUtils.getCubeVertex(3, i, j),
                drawUtils.getCubeVertex(7, i, j),
            ];
            var side5 = [
                0.035 + 3.5 * i, 0.035 + 3.5 * j, 0.070,
                -0.035 + 3.5 * i, 0.035 + 3.5 * j, 0.070,
                -0.035 + 3.5 * i, -0.035 + 3.5 * j, 0.070,
                0.035 + 3.5 * i, -0.035 + 3.5 * j, 0.070,
            ];
            var cube = [side1, side2, side3, side4, side5];
            var cubeNormal = [
                drawUtils.calcNormal(side1),
                drawUtils.calcNormal(side2),
                drawUtils.calcNormal(side3),
                drawUtils.calcNormal(side4),
                drawUtils.calcNormal(side5)
            ];

            return [cube, cubeNormal]
        },
        calcNormal: (cubeSide) => {
            var v1 = [cubeSide[3] - cubeSide[0], cubeSide[4] - cubeSide[1], cubeSide[5] - cubeSide[2]];
            var v2 = [cubeSide[3] - cubeSide[6], cubeSide[4] - cubeSide[7], cubeSide[5] - cubeSide[8]];
            var normal = [0.0, 0.0, 0.0];
            normal[0] = v1[1] * v2[2] - v1[2] * v2[1];
            normal[1] = v1[2] * v2[0] - v1[0] * v2[2];
            normal[2] = v1[0] * v2[1] - v1[1] * v2[0];
            normalResult = [normal[0] * -1, normal[1] * -1, normal[2] * -1];

            if (normalResult[0] > 0.003)
                normalResult[0] = 0.707;
            else if (normalResult[0] < -0.003)
                normalResult[0] = -0.707;
            if (normalResult[1] > 0.003)
                normalResult[1] = 0.707;
            else if (normalResult[1] < -0.003)
                normalResult[1] = -0.707;
            if (normalResult[2] > 0.003)
                normalResult[2] = 0.707;
            else if (normalResult[2] < -0.003)
                normalResult[2] = -0.707;
            return normalResult;
        },
        setTexcoords: (gl, x) => {
            if (x == 1) {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                    0, 0,
                    0, 1,
                    1, 0,
                    1, 1
                ]), gl.DYNAMIC_DRAW);
            } else {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                    1, 1,
                    0, 1,
                    0, 0,
                    1, 0,
                ]), gl.DYNAMIC_DRAW);
            }
        }
    };
    global.drawUtils = drawUtils;
})(window || this);