const vertex_shader = `#version 300 es
in vec2 a_position;
in vec4 a_color;
out vec4 color;


uniform mat4 scale_matrix;
uniform mat4 transformatiom_matrix;
uniform mat4 rotation_matrix;
void main() {
    gl_Position = transformatiom_matrix * rotation_matrix * scale_matrix * vec4(a_position, 0.0, 1.0);
    color = a_color;
}
`;

const fragment_shader= `#version 300 es
    
    precision mediump float;
    in vec4 color;
    out vec4 o_color;
    void main() {
        o_color = color;
    }
`;

