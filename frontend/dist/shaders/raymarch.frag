#version 300 es

precision highp float;

in vec2 outUV;

out vec3 outColor;

const float INFINITY = uintBitsToFloat(0x7F800000u);
const float NEGATIVE_INFINITY = uintBitsToFloat(0xFF800000u);

float scene(vec3 pos) {
    float dist = INFINITY;

    dist = min(dist, distance(pos, vec3(0.3, 0.7, 2.0) - 1.0));

    return dist;
}

vec3 march(vec3 pos, vec3 dir) {
    dir = normalize(dir);

    for (int i = 0; i < 100; i++) {
        float dist = scene(pos);
        if (dist < 0.01) {
            break;
        }

        pos += dir * dist;
    }

    return pos;
}

void main() {
    vec4 c = vec4(outUV, 1.0, 0.0);
    outColor = c.zxy;
}
