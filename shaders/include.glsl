#version 300 es

precision highp float;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 rand3(vec2 co) {
    return vec3(rand(co), rand(co.yx + 0.01), rand(co + 0.02));
}
