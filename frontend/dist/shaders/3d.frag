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
    lightdir = vec3(0.0, 0.0, 1.0);
    vec3 normal = normalize(out_normal);

    vec3 color = vec3(0.0);
    color = rand3(vec2(float(index_id), 0.3));
    float depth = 1.0 - clamp(pow(gl_FragCoord.z * 0.1 / gl_FragCoord.w, 2.0), 0.0, 1.0);
    color = vec3(0.9, 0.2, 0.1);
    depth = 1.0;
    float diffuse = 1.0;
    diffuse = dot(normal, lightdir);
    diffuse = diffuse * 0.5 + 0.5;
    diffuse = clamp(diffuse, 0.0, 1.0);
    if (diffuse > 0.9995) {
        color = vec3(1.0);
    }

    diffuse *= diffuse * diffuse;
    float steps = float(2);
    diffuse = round(diffuse * steps + 0.3) / steps;
    // diffuse = step(0.8, diffuse);

    color *= diffuse;
    out_color = vec4(color * depth, depth);
}
