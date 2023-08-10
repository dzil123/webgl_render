layout (location = 0) in vec3 in_pos;
layout (location = 1) in vec3 in_normal;
// layout (location = 2) in vec3 in_uv;
// layout (location = 3) in vec3 in_tangent;

out vec3 out_pos; // camera space
out vec3 out_normal;
flat out int index_id;

uniform mat4 modelview_mat; // model -> world -> camera
uniform mat4 projection_mat; // camera -> clip

void main() {
    out_pos = (modelview_mat * vec4(in_pos, 1.0)).xyz;
    // out_normal = (modelview_mat * vec4(in_normal, 0.0)).xyz;
    out_normal = in_normal;

    gl_Position = projection_mat * vec4(out_pos, 1.0);
    index_id = gl_VertexID;
    // gl_FragCoord = gl_Position / gl_Position.w;
}
