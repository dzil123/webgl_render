layout (location = 0) in vec3 in_pos;

out vec3 out_pos; // camera space
flat out int index_id;

uniform mat4 modelview_mat; // model -> world -> camera
uniform mat4 projection_mat; // camera -> clip

void main() {
    out_pos = (modelview_mat * vec4(in_pos, 1.0)).xyz;
    gl_Position = projection_mat * vec4(out_pos, 1.0);
    index_id = gl_VertexID;
    // gl_FragCoord = gl_Position / gl_Position.w;
}
