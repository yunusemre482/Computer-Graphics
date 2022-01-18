void main() {
    in vec4 a_position;
    in vec4 a_color;
    out vec4 color;
    
    void main() {
        gl_Position = a_position;
        color = a_color;
    }
}