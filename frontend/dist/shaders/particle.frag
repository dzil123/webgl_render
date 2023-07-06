#version 300 es

precision highp float;

in vec2 outUV;
flat in int indexID;

out vec4 outColor;

void main() {
    // outColor = vec4(gl_FragCoord.rgb / 1000.0, 1.0);
    // outColor = vec4(outUV, 0.0, 1.0);
    // outColor = vec4(0.0, 0.0, 0.0, 1.0) * outUV.x;

    outColor = vec4(vec3(smoothstep(0.0, 0.005, distance(outUV, vec2(0.0)) - 0.98)), 1.0);
}
