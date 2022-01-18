
const main =()=>{
    const canvas = document.querySelector("#glCanvas");
    canvas.height = $(window).height();
    canvas.width = $(window).width();
    const gl = glUtils.checkWebGL(canvas);
    const vertexShader=glUtils.createShader(gl, gl.VERTEX_SHADER, vertex_shader)
    const monkeyShader = glUtils.createShader(gl, gl.FRAGMENT_SHADER, monkey_head_shader);
    const surfaceShader=glUtils.createShader(gl, gl.FRAGMENT_SHADER, surface_shader);
    
    gl.clearColor(255 / 255.0, 255 / 255.0, 255 / 255.0, 1.0);       // set canvas color towhite
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    drawUtils.readMonkeyHead(drawUtils.drawScene,gl,canvas,vertexShader,monkeyShader,surfaceShader);
    document.addEventListener('keydown',function(event){
        drawUtils.clickEvent(event.keyCode,canvas);
    })
}

main();
