#version 300 es

precision highp float;

in vec2 outUV;

out vec4 outColor;

const float INFINITY = uintBitsToFloat(0x7F800000u);
const float NEGATIVE_INFINITY = uintBitsToFloat(0xFF800000u);

float scene(vec3 pos) {
    float dist = INFINITY;

    dist = min(dist, distance(pos, vec3(0, 0, 0)) - 1.0);
    dist = min(dist, distance(pos, vec3(8, 0, -3)) - 1.0);
    dist = min(dist, distance(pos, vec3(-3, -2, 1)) - 1.0);

    return dist;
}

vec3 march(vec3 pos, vec3 dir) {
    dir = normalize(dir);

    for (int i = 0; i < 100; i++) {
        float dist = scene(pos);
        if (dist < 0.0001) {
            break;
        }

        pos += dir * dist * 0.99;
    }

    return pos;
}

vec3 shade(vec3 pos) {
    if (pos.y < -2.) {
        return vec3(0.4, 0.3, 0.1);
    }
    if (pos.z < -10.) {
        return vec3(0.2);
    }

    return vec3(1.0, fract(pos.xy));
}

// returns the half extents of the virtual plane in front of the camera
// where points are projected to from the origin
// fov is the vertical fov, as default in most games
// aspect is width / height
vec2 image_plane(float fov, float aspect) {
    vec2 plane;
    plane.y = tan(fov / 2.);
    plane.x = plane.y * aspect;
    return plane;
}

// returns the direction the ray travels from the origin
// the camera looks in the -z dir
// plane is given by image_plane()
// 0 <= uv <= 1
vec3 ray_dir(vec2 plane, vec2 uv) {
    uv = uv * 2. - 1.;
    vec2 pos = uv * plane;
    return normalize(vec3(pos, -1.0));
}

mat4 camera_transform() {
    mat4 m;
    m[0] = vec4(1, 0, 0, 0);
    m[1] = vec4(0, 0.94, -0.342, 0);
    m[2] = vec4(0, 0.342, 0.94, 0);
    m[3] = vec4(0, 1, 5, 1);
    return m;
}

vec3 main2() {
    float fov = radians(70.0);
    float aspect = 2.0;

    mat4 transform = camera_transform();
    vec3 origin = (transform * vec4(vec3(0), 1)).xyz;

    vec2 plane = image_plane(fov, aspect);

    vec3 dir = ray_dir(plane, outUV);
    dir = (transform * vec4(dir, 0)).xyz;

    vec3 hit_pos = march(origin, dir);

    vec3 color = shade(hit_pos);

    return color;
}

void main() {
    outColor = vec4(main2(), 1.0);
}
