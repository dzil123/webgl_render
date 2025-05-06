in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform sampler2D bw;
uniform sampler2D buffer;
uniform uint frame;

#define FUNCALT(type, name)       \
    type name(ivec2 offset);      \
    type name(int x, int y) {     \
        return name(ivec2(x, y)); \
    }                             \
    type name() {                 \
        return name(0, 0);        \
    }                             \
    type name(ivec2 offset)

FUNCALT(ivec2, UV) {
    vec2 tex_size = vec2(textureSize(buffer, 0));
    ivec2 iUV = ivec2(outUV * tex_size + 0.5 / tex_size);
    return iUV + offset;
}

FUNCALT(vec3, RAND) {
    return rand3i(ivec3(UV(offset), frame));
}

FUNCALT(float, BUFFER) {
    return texelFetch(buffer, UV(offset), 0).r;
}

#define PROBABILITY 0.2
#define RANDEVAL(POS, left, mid, right)                \
    do {                                               \
        if (RAND POS.y < PROBABILITY) {                \
            OP(left);                                  \
        } else if (RAND POS.y > (1.0 - PROBABILITY)) { \
            OP(right);                                 \
        } else {                                       \
            OP(mid);                                   \
        }                                              \
    } while (false)

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
    emit = float(UV() == ivec2(50, 0));
    // f += max(BUFFER(0, -1), BUFFER() - 0.25);
    // f += BUFFER(0, -1);

    float decay = RAND().x;
    decay = max(0., min(1., decay));
    decay = pow(decay, 1.02);
    decay = mix(0.0, 0.01, decay);
    // decay = 0.02;

#define OP f +=
    RANDEVAL((-1, 0), BUFFER(-1, 0), 0., 0.);
    RANDEVAL((1, 0), 0., 0., BUFFER(1, 0));
    RANDEVAL((0, -1), 0., BUFFER(0, -1), 0.);
#undef OP

    f = max(emit, f);
    f -= decay;

    color = vec3(f);
    // uvec2 SIZE = uvec2(textureSize(buffer, 0));
    // ivec2 pos = ivec2(frame % SIZE.x, (frame / SIZE.x) % SIZE.y);
    outColor = vec4(color, 1.);
}
