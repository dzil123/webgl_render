in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform uvec2 resolution;
uniform sampler2D bw;
uniform sampler2D buffer;

void main() {
    vec3 color = vec3(0);

    float texout = texture(bw, outUV).r;
    color.rgb = vec3(texout);

    color.rgb = texture(buffer, outUV).rgb;

    uvec2 coord = uvec2(outUV * vec2(resolution));
    color.rg = vec2(coord);

    outColor = vec4(color, 1.);
}
