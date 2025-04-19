in vec2 outUV;

out vec4 outColor;

const float INFINITY = uintBitsToFloat(0x7F800000u);
const float NEGATIVE_INFINITY = uintBitsToFloat(0xFF800000u);

uniform sampler2D cameraMatrix;
uniform sampler2D sceneSpheres;
uniform sampler2D globals;

#define GLOBALS(x) texelFetch(globals, ivec2(x, 0), 0)
#define TIME GLOBALS(0).x
#define FOV radians(GLOBALS(0).y)
#define ASPECT GLOBALS(0).z

// https://iquilezles.org/www/articles/smin/smin.htm
float sminCubic(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

float loop(float x, float a, float b) {
    return mod(x - b, a - b) + b;
}

void loop2(inout float x, float a, float b) {
    x = loop(x, a, b);
}

// https://iquilezles.org/www/articles/distfunctions/distfunctions.htm
vec3 opRep(in vec3 p, in vec3 c) {
    return mod(p + 0.5 * c, c) - 0.5 * c;
}

// instead of distance, give nearest point?
float scene(vec3 pos) {
    // pos.x -= 1.0;
    // pos.y -= 0.5;
    // loop2(pos.z, 5.0, -5.0);
    // loop2(pos.x, 6.0, -4.0);
    // loop2(pos.y, 4.0, -3.0);
    // pos = opRep(pos, vec3(12));

    float dist = INFINITY;

    float time = TIME;
    float k = 0.1 + 2.0 * (1. + sin(time));

    int numSpheres = textureSize(sceneSpheres, 0).y;
    for (int i = 0; i < numSpheres; i++) {
        vec4 data = texelFetch(sceneSpheres, ivec2(0, i), 0);
        vec3 center = data.xyz;
        float radius = data.w;

        dist = sminCubic(dist, distance(pos, center) - radius, k);
    }

    return dist;
    // return dist - 2. * (sin(TIME * 0.7) * 0.5 - 0.5);
}

bool at_infinity(vec3 pos) {
    return length(pos) > 1000.0;
}

vec4 march(vec3 pos, vec3 dir, inout float min_dist) {
    float time = 1.;

    // pos.y -= 1.2;
    // pos.y -= sin(time) * 0.2;
    // pos.x -= time;
    // pos.z -= time * 20.0;
    const int MAX_STEPS = 150;

    dir = normalize(dir);

    int i;
    for (i = 0; i < MAX_STEPS; i++) {
        float dist = scene(pos);
        if (i > 10) {  // heuristic to avoid ambient occlusion
            min_dist = min(min_dist, dist);
        }
        if (dist < 0.0001 || at_infinity(pos)) {
            break;
        }

        pos += dir * dist * 0.999;
    }

    // if (i == MAX_STEPS) {
    //     i = -1;
    // }

    return vec4(pos, i);
}

// https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 calcNormal(in vec3 p) {
    const float eps = 0.001;  // arbitrary
    const vec2 h = vec2(eps, 0);
    return normalize(vec3(scene(p + h.xyy) - scene(p - h.xyy),
                          scene(p + h.yxy) - scene(p - h.yxy),
                          scene(p + h.yyx) - scene(p - h.yyx)));
}

float easeInOutQuint(float x) {
    return x < 0.5 ? 16. * x * x * x * x * x : 1. - pow(-2. * x + 2., 5.) / 2.;
}

float shadow(vec3 pos, vec3 dir) {
    float min_dist = INFINITY;
    vec4 hit_pos = march(pos, dir, min_dist);

    if (!at_infinity(hit_pos.xyz)) {
        return 0.0;  // completely obstructed
    }

    float steps = hit_pos.w;

    const float CUTOFF = 50.0;

    float res = 1.0 - pow(1.1, steps - CUTOFF);
    // res = smoothstep(90.0, 1.0, hit_pos.w);
    res = smoothstep(0.0, 1.0, res);
    res = min_dist * 5.0;
    res = clamp(res, 0.0, 1.0);
    return res;

    return 1.0;
}

vec3 shade2(vec4 pos) {
    // return vec3(1.0, smoothstep(0.0, 7.0, pow(pos.w, 0.5)), 0.0);
    vec3 p = step(0.5, fract(pos.xyz * 2.0));
    float f = p.x + p.y + p.z;

    vec3 normal = calcNormal(pos.xyz);
    vec3 l = normalize(vec3(3., 5, 2.));

    vec3 new_pos = pos.xyz + normal * 0.01;
    // return vec3(shadow(new_pos, l));

    // return abs(calcNormal(pos.xyz));
    // return calcNormal(pos.xyz) * 0.5 + 0.5;
    float facing = dot(normal, l);
    facing = smoothstep(0.0, 1.0, facing);
    // facing = smoothstep(0.0, 1.0, facing);
    // facing = smoothstep(-0.5, 1.0, facing);
    facing = clamp(facing, 0.0, 1.0);
    facing *= shadow(new_pos, l);
    return vec3(facing);

    // return mix(abs(calcNormal(pos.xyz)), vec3(mod(f, 2.)),
    //            easeInOutQuint(sin(TIME / 3.0) * 0.5 + 0.5));

    return p;
}

vec3 shade(vec4 pos) {
    // return vec3((pos.w - 10.) / 30.);

    // if (pos.w < 0.) {
    //     return vec3(0.);
    // }

    // return vec3(1. - smoothstep(TIME * 5.0 + 15., TIME * 5.0 + 20., pos.w));

    vec3 grey = vec3(0.1, 0.05, 0.05);

    if (pos.y < -14.) {
        return grey;
    }
    if (at_infinity(pos.xyz)) {
        return grey;
    }

    vec3 res = shade2(pos);
    return res;
    if (pos.w < 0.) {
        return res;
    }

    float k = pow(pos.w / 150.0, 1.5);
    k = clamp(k, 0.0, 1.0);
    // k = 0.;

    return mix(res, grey, k);
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
    m[0] = texelFetch(cameraMatrix, ivec2(0, 0), 0);
    m[1] = texelFetch(cameraMatrix, ivec2(1, 0), 0);
    m[2] = texelFetch(cameraMatrix, ivec2(2, 0), 0);
    m[3] = texelFetch(cameraMatrix, ivec2(3, 0), 0);
    return m;
}

vec3 main2() {
    float fov = FOV;
    float aspect = ASPECT;

    mat4 transform = camera_transform();
    vec3 origin = (transform * vec4(vec3(0), 1)).xyz;

    vec2 plane = image_plane(fov, aspect);

    vec3 dir = ray_dir(plane, outUV);
    dir = (transform * vec4(dir, 0)).xyz;

    float min_dist = INFINITY;
    vec4 hit_pos = march(origin, dir, min_dist);

    vec3 color = shade(hit_pos);

    return color;
}

void main() {
    outColor = vec4(main2(), 1.0);
}
