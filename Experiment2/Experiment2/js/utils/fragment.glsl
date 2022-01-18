#version 300 es
precision mediump float;
in vec4 color;
out vec4 o_color;

uniform float color_g;
uniform int shape_id;
void main() {

    if(shape_id == 0) {
        o_color = vec4(color[0], color[1] + color_g, color[2], 1);
    } else {
        o_color = color;
    }
}