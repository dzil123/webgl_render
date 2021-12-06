#version 300 es

precision highp float;

in vec2 outUV;  // 0 to 1

out vec4 outColor;

// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm
// loops space infinitely
vec3 opRep(in vec3 p, in vec3 c) {
    return mod(p + 0.5 * c, c) - 0.5 * c;
}

// returns signed distance from a world-space position to the scene
float scene(vec3 pos) {
    pos = opRep(pos, vec3(12));

    float dist = 100000.0;

    dist = min(dist, distance(pos, vec3(0, 0, -1)) - 2.7);
    dist = min(dist, distance(pos, vec3(3, 1, 0)) - 1.2);
    dist = min(dist, distance(pos, vec3(-2, -1, 1)) - 1.);

    return dist;
}

const int MAX_STEPS = 100;

// raymarches starting at position pos in the direction dir
vec4 march(vec3 pos, vec3 dir) {
    int i;
    for (i = 0; i < MAX_STEPS; i++) {
        float dist = scene(pos);
        if (dist < 0.0001) {
            break;
        }

        pos += dir * dist;
    }

    return vec4(pos, i);
}

vec3 shade(vec4 pos) {
    vec3 grey = vec3(0.1, 0.05, 0.05);

    if (abs(pos.y) > 14.) {
        return grey;
    }
    if (pos.w == float(MAX_STEPS)) {
        return grey;
    }

    vec3 res = step(0.5, fract(pos.xyz * 2.0));
    return res;
}

// returns the half extents of the virtual plane in front of the camera
// where points are projected to from the origin
// fov is the vertical fov, as default in most games
// aspect is width / height
vec2 image_plane() {
    float fov = radians(70.0);
    float aspect = 1.9;

    vec2 plane;
    plane.y = tan(fov / 2.);
    plane.x = plane.y * aspect;
    return plane;
}

// returns the direction the ray travels from the origin
// the camera looks in the -z dir
// 0 <= uv <= 1
vec3 ray_dir(vec2 uv) {
    vec2 plane = image_plane();
    uv = uv * 2. - 1.;
    vec2 pos = uv * plane;
    return normalize(vec3(pos, -1.0));
}

// simple translate + rotate matrix. no scaling
mat4 camera_transform() {
    mat4 m;
    m[0] = vec4(0.760406, 0, -0.649448, 0);
    m[1] = vec4(-0.039648, 0.998135, -0.046421, 0);
    m[2] = vec4(0.648236, 0.061048, 0.758988, 0);
    m[3] = vec4(3.823527, 0.299516, 7.624601, 1);
    return m;
}

vec3 main2() {
    mat4 transform = camera_transform();
    vec3 origin = (transform * vec4(0, 0, 0, 1)).xyz;

    vec3 dir = ray_dir(outUV);
    dir = (transform * vec4(dir, 0)).xyz;

    vec4 hit_pos = march(origin, dir);

    vec3 color = shade(hit_pos);

    return color;
}

void main() {
    outColor = vec4(main2(), 1.0);
}
