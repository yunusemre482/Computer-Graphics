const vertex_shader = `#version 300 es
    in vec3 a_position;
    uniform mat4 u_model_view;
    uniform mat4 u_projection;
    uniform mat4 rotation_matrix;

    void main() {
      
        gl_Position = u_projection * u_model_view * rotation_matrix * vec4(a_position, 1.0);
    }
`;

const monkey_head_shader = `#version 300 es
    precision mediump float;
    out vec4 o_color;
    
    void main() {
        o_color = vec4(0.65,0.7, 0.64, 1.0);
    }
`;

const surface_shader = `#version 300 es
    precision mediump float;
    out vec4 o_color;
    void main() {
        o_color = vec4(0.0,1.0, 0.0,1.0);
    }
`;
