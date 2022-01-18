var canvas;
var gl;
var tracker;
var mod, modLoc, thetaLoc;
var program;
var shininess = 4000;
var lightDirection = [0, 0, 1]; // this is computed in updateScene
var innerLimit;
var outerLimit;
var pTexCoordLoc;
var texture;
var texture1;
var u_image0Location;
var u_image1Location;
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var perFragment = 1.0;
var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)];
var planePositions = [
    100.0, 100.0, 0.0, -100.0, 100.0, 0.0, -100.0, -100.0, 0.0,
    100.0, -100.0, 0.0
];
var planeNormal = [
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
];
var cubes = [];
var cubesNormal = [];
var near = 0.1;
var far = 9.0;
var radius = 2.0;
var theta = 0.0;
var radian = 0.0;
var speed = 0.05;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;
var fovy = 45.0; // Field-of-view in Y direction angle (in degrees)
var aspect; // Viewport aspect ratio
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc, shininessLoc,
    lightDirectionLoc, innerLimitLoc, outerLimitLoc, lightPositionLoc,
    viewPositionLoc;
var eye;
var eyeplus = vec3(-0.1, 0.0, 0.1);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.2, 0.0);


window.onresize = function resize() {
    var displayWidth = window.innerWidth;
    var displayHeight = window.innerHeight;
    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        aspect = canvas.width / canvas.height;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
    }
}
window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initcubes();
    gl = glUtils.checkWebGL(canvas);

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert,
        false);
    window.onkeydown = detectInputKey;
    var grossImage = document.getElementById("gross");
    var emojiImage = document.getElementById("emoji");

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.width / canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    program = initShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    pTexCoordLoc = gl.getAttribLocation(program, "a_pTexCord");
    u_image0Location = gl.getUniformLocation(program, "u_image0");
    u_image1Location = gl.getUniformLocation(program, "u_image1");

    glUtils.configureTexture(program, grossImage);
    glUtils.configureTexture1(program, emojiImage)

    canvas.requestPointerLock = canvas.requestPointerLock || canvas
        .mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document
        .mozExitPointerLock;
    outerLimitLoc = gl.getUniformLocation(program, "outerLimit");
    lightPositionLoc = gl.getUniformLocation(program, "lightWorldPosition");
    viewPositionLoc = gl.getUniformLocation(program, "viewWorldPosition");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    shininessLoc = gl.getUniformLocation(program, "shininess");
    lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
    innerLimitLoc = gl.getUniformLocation(program, "innerLimit");

    projectionMatrixLoc = gl.getUniformLocation(program,
        "projectionMatrix");
    modLoc = gl.getUniformLocation(program, "mod");
    thetaLoc = gl.getUniformLocation(program, "theta");
    innerLimit = 5 * Math.PI / 180;
    outerLimit = 20 * Math.PI / 180;
    tracker = document.getElementById('tracker');

    render();
}


function initcubes() {
    for (var i = -0.96; i <= 0.96; i += 0.08) {
        for (var j = -0.96; j <= 0.96; j += 0.08) {
            const [cube, normals] = drawUtils.createCube(i, j);
            cubes.push(cube);
            cubesNormal.push(normals);
        }
    }
}

function lockChangeAlert() {
    if (document.pointerLockElement === canvas || document
        .mozPointerLockElement === canvas) {
        document.addEventListener("mousemove", updatePosition, false);
    } else {
        document.removeEventListener("mousemove", updatePosition, false);
    }
}

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi) + eyeplus[0],
        radius * Math.sin(theta) * Math.sin(phi) + eyeplus[1], radius *
        Math.cos(theta) + eyeplus[2]);
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    normalMatrix = inverse(modelViewMatrix);
    normalMatrix = transpose(normalMatrix);
    radian += speed;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.uniform3fv(lightPositionLoc, eye);
    gl.uniform3fv(viewPositionLoc, eye);
    gl.uniform1f(shininessLoc, shininess);
    gl.uniform1f(gl.getUniformLocation(program, "perFragment"),
        perFragment);
    var lmat = lookAt(eye, at, up);
    lightDirection = [-lmat[0][2], -lmat[1][2], -lmat[2][2]];
    gl.uniform3fv(lightDirectionLoc, lightDirection);
    gl.uniform1f(innerLimitLoc, Math.cos(innerLimit));
    gl.uniform1f(outerLimitLoc, Math.cos(outerLimit));
    gl.uniform1f(thetaLoc, radian);
    var ambienP = mult(lightAmbient, materialAmbient);
    var diffP = mult(lightDiffuse, materialDiffuse);
    var specP = mult(lightSpecular, materialSpecular);
    gl.uniform4fv(gl.getUniformLocation(program, "AmbientProduct"),
        ambienP);
    gl.uniform4fv(gl.getUniformLocation(program, "DiffuseProduct"),
        diffP);
    gl.uniform4fv(gl.getUniformLocation(program, "SpecularProduct"),
        specP);
    drawPlane();
    for (var index = 0; index < 625; index++) {
        for (var i = 0; i < 5; i++) {
            for (var i = 0; i < 5; i++) drawSide(index, i);
        }
    }
    requestAnimationFrame(render);
}

function detectInputKey(event) {
    switch (event.keyCode) {
        case 69: { // e
            if (document.pointerLockElement === canvas) {
                document.exitPointerLock()
            } else {
                canvas.requestPointerLock();
            }
            break;
        }
        case 80: {
            perFragment = -perFragment;
            break;
        }
        case 79: {
            if (perFragment == 1 || perFragment == -1) {
                perFragment *= 10;
            } else {
                perFragment /= 10;
            }
            break;
        }
        case 38: { // up
            eyeplus[2] -= 0.015;
            at[2] -= 0.015;
            break;
        }
        case 40: { // down
            eyeplus[2] += 0.005;
            at[2] += 0.005;
            break;
        }
        case 39: { // right
            eyeplus[0] += 0.005;
            at[0] += 0.005;
            break;
        }
        case 37: { // left
            eyeplus[0] -= 0.005;
            at[0] -= 0.005;
            break;
        }
        case 33: { // page up
            eyeplus[1] += 0.005;
            at[1] += 0.005;
            break;
        }
        case 34: { // page down
            eyeplus[1] -= 0.005;
            at[1] -= 0.005;
            break;
        }
        case 107: { // +
            speed += 0.005;
            break;
        }
        case 109: { // -
            speed -= 0.005;
            break;
        }
    }
}

function updatePosition(e) {
    var x = Math.PI / 180 * e.movementX;
    var y = Math.PI / 180 * e.movementY;
    theta += x / 12;
    phi += y / 12;
}

function drawPlane() {
    gl.activeTexture(gl.TEXTURE1 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(u_image0Location, 1);
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planeNormal), gl
        .DYNAMIC_DRAW);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planePositions), gl.DYNAMIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    mod = 0.0;
    gl.uniform1f(modLoc, mod);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    drawUtils.setTexcoords(gl, 1);
    gl.vertexAttribPointer(pTexCoordLoc, 2, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(pTexCoordLoc);
    // Create a texture.
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}


function drawSide(index, sideIndex) {
    var normalFix = []
    for (i = 0; i < 4; i++) {
        normalFix.push(cubesNormal[index][sideIndex][0]);
        normalFix.push(cubesNormal[index][sideIndex][1]);
        normalFix.push(cubesNormal[index][sideIndex][2]);
    }
    gl.activeTexture(gl.TEXTURE1 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(u_image0Location, 1);
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalFix), gl
        .DYNAMIC_DRAW);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubes[index][sideIndex]),
        gl.DYNAMIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    mod = 1.0;
    gl.uniform1f(modLoc, mod);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    drawUtils.setTexcoords(gl, 0);
    gl.vertexAttribPointer(pTexCoordLoc, 2, gl.FLOAT, true, 0, 0);
    gl.enableVertexAttribArray(pTexCoordLoc);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}


