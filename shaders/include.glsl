#version 300 es

precision highp float;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 rand3(vec2 co) {
    return vec3(rand(co), rand(co.yx + 0.01), rand(co + 0.02));
}

uvec3 pcg3d(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v = v >> 16u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    return v;
}

float _uintToFloat(uint h) {
    const uint mantissaMask = 0x007FFFFFu;
    const uint one = 0x3F800000u;

    h &= mantissaMask;
    h |= one;

    float r2 = uintBitsToFloat(h);
    return r2 - 1.0;
}

vec3 rand3i(ivec3 iv) {
    uvec3 v = pcg3d(uvec3(iv));
    return vec3(_uintToFloat(v.x), _uintToFloat(v.y), _uintToFloat(v.z));
}
