#version 300 es
in vec4 a_position;
in vec4 a_color;
out vec4 color;

uniform mat4 transformation_matrix;

void main() {

    gl_Position = transformation_matrix * vec4(a_position.x * 0.45, a_position.y * 0.45, a_position.z * 0.45, 1.0);
    color = a_color;
}