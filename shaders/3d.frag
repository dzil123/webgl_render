in vec3 out_pos;
flat in int index_id;

out vec4 out_color;

uniform mat4 modelview_mat; // model -> world -> camera
uniform mat4 projection_mat; // camera -> clip

void main() {
    out_color = vec4(rand3(vec2(float(index_id), 0.3)), 1.0);
}
