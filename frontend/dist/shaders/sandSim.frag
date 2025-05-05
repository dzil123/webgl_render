in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform sampler2D bw;
uniform sampler2D buffer;
uniform uint frame;

void main() {
    vec3 color = vec3(0);
    float f = 0.;

    vec3 rand = rand3(outUV + vec2(frame, 0));

    vec2 tex_size = vec2(textureSize(buffer, 0));

    float bw_sample = texture(bw, outUV).r;
    // float buf_sample = texture(buffer, outUV).r;
    float buf_sample = textureOffset(buffer, outUV, ivec2(0, -1)).r;
    float decay = rand.x;
    decay = pow(decay, 3.);
    decay = mix(0.01, 0.1, decay);
    buf_sample -= decay;

    f = max(bw_sample, buf_sample);

    color = vec3(f);
    outColor = vec4(color, 1.);
}
