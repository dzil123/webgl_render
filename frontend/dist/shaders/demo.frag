#version 300 es

precision highp float;

in vec2 outUV;

// gl_FragColor does not exist in webgl2, you must use an explicit out variable instead
// however there seems to be a default layout(0) set by webgl equivalent to fragcolor
out vec4 outColor;

// layout(origin_upper_left) in vec4 gl_FragCoord;

const vec4 in_colors[] =
    vec4[](vec4(1.0, 0.5, 0.0, 1.0), vec4(0.5), vec4(0.9), vec4(0.0, 1.0, 1.0, 0.0));

// layout(std140) uniform One {
//     vec4 in_colors2[6];
// };

uniform sampler2D in_colors3;

// vec4 in_colors3[];

void main() {
    vec3 color;

    // color = vec3(in_colors[int(outUV.x * float(in_colors.length()))]);
    // color = vec3(in_colors2[int(outUV.x * float(in_colors2.length()))]);
    // color = vec3(in_colors2[int(outUV.x * float(in_colors2.length()))]);

    float size = float(textureSize(in_colors3, 0).x);
    int index = int(outUV.x * size);
    ivec2 pos = ivec2(index, 0);

    color = vec3(in_colors[index]);

    // color = texture(in_colors3, vec2(index, 0)).rgb;
    color = texelFetch(in_colors3, pos, 0).rgb;

    outColor = vec4(color, 1.0);
}
