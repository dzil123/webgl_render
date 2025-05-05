in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform sampler2D bw;
uniform sampler2D buffer;
uniform uint frame;

#define FUNCALT(type, name) type name(int x, int y) { return name(ivec2(x, y)); } type name() { return name(0, 0); }

ivec2 UV(ivec2 offset) {
    vec2 tex_size = vec2(textureSize(buffer, 0));
    ivec2 iUV = ivec2(outUV * tex_size + 0.5 / tex_size);
    return iUV + offset;
}
FUNCALT(ivec2, UV)

vec3 RAND(ivec2 offset) {
    return rand3i(ivec3(UV(offset), frame));
}
FUNCALT(vec3, RAND)

float BUFFER(ivec2 offset) {
    return texelFetchOffset(buffer, UV(offset), 0, ivec2(0, -1)).r;
}
FUNCALT(float, BUFFER)

void _eval(inout float f, float mod, int xr, int xb, bool left) {
    float p = 0.2;
    if ((left && (RAND(xr, 0).y < p)) || (!left && (RAND(xr, 0).y > (1.0 - p)))) {
        f += mod * BUFFER(xb, 0) * 1.0;
    }
}

void main() {
    vec3 color = vec3(0);
    float f = 0.;

    float emit = 0.;
    emit = texelFetch(bw, UV(), 0).r;
    // emit = float(UV() == ivec2(25, 0));
    f += max(BUFFER(), BUFFER(0, 1) - 0.25);

    float decay = RAND().x;
    decay = max(0., min(1., decay));
    decay = pow(decay, 1.02);
    decay = mix(0.01, 0.1, decay);
    // decay = 0.02;

    _eval(f, 0.81, -1, -1, true);
    _eval(f, 0.81, 1, 1, false);
    float f0 = 0.;
    _eval(f0, -1., 0, 0, true);
    _eval(f0, -1., 0, 0, false);
    if (f0 < -1.1 * BUFFER()) {
        // f = 100.0;
    }
    f += max(-1., f0);

    f = max(emit, f);
    f -= decay;

    color = vec3(f);
    outColor = vec4(color, 1.);
}
