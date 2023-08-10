in vec3 out_pos;
in vec3 out_normal;
flat in int index_id;

out vec4 out_color;

uniform mat4 modelview_mat; // model -> world -> camera
uniform mat4 projection_mat; // camera -> clip
// uniform vec3 lightdir;

void main() {
    vec3 lightdir = normalize(vec3(1.0, 2.0, 3.0));
    lightdir = (modelview_mat * vec4(lightdir, 0.0)).xyz;
    vec3 normal = normalize(out_normal);

    // float lambert = clamp(dot(out_normal, lightdir) * 0.5 + 1.0, 0.0, 1.0);
    vec3 color = vec3(0.0);
    color = rand3(vec2(float(index_id), 0.3));
    float depth = 1.0 - clamp(pow(gl_FragCoord.z * 0.1 / gl_FragCoord.w, 2.0), 0.0, 1.0);
    depth = 1.0;
    color *= dot(normal, lightdir), 0.0, 1.0 * 0.5 + 0.5;
    out_color = vec4(color * depth, depth);
}
