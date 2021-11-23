#version 300 es

precision highp float;

in vec2 outUV;

// gl_FragColor does not exist in webgl2, you must use an explicit out variable instead
// however there seems to be a default layout(0) set by webgl equivalent to fragcolor
out vec4 outColor;

// layout(origin_upper_left) in vec4 gl_FragCoord;

void main() {
    // outColor = vec4(1.0, 1.0, 0.0, 1.0);
    outColor = vec4(outUV * 0.5 + 0.5, 0.0, 1.0);
    // outColor = gl_FragCoord * 0.01;
    // outColor = vec4(gl_PointCoord, 0.0, 1.0);
}
