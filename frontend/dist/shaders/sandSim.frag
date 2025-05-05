in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform sampler2D bw;
uniform sampler2D buffer;

void main() {
    vec3 color = vec3(0);
    float f = 0.;

    float bw_sample = texture(bw, outUV).r;
    // float buf_sample = texture(buffer, outUV).r;
    float buf_sample = textureOffset(buffer, outUV, ivec2(0, -1)).r;
    buf_sample = max(0., buf_sample - 0.1);

    f = max(bw_sample, buf_sample);

    color = vec3(f);
    outColor = vec4(color, 1.);
}
