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
    ivec2 uv = UV(offset);
    ivec2 size = textureSize(buffer, 0);
    uv = clamp(uv, ivec2(0), size - ivec2(1));
    return texelFetch(buffer, uv, 0).r;
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

#define GET(X, Y) (int((BUFFER(X, Y) > 0.5) || UV(X, Y).y <= 0))
bool sand_simulator(bool water) {
    const int SAND[4] = int[](41088, 51200, 65274, 65516);
    const int WATER[4] = int[](49280, 43008, 65274, 65516);

    int iframe = int(frame);
    int pos2x2 = ((UV().x ^ iframe) & 1) | (((UV().y << 1) ^ (iframe + 1)) & 2);
    int data = (water ? WATER[pos2x2] : SAND[pos2x2]);

    int x1 = -(pos2x2 & 1);
    int y1 = (pos2x2 >> 1) & 1;

    int pos = GET(x1, y1) | (GET(x1 + 1, y1) << 1) | (GET(x1, y1 - 1) << 2) |
              (GET(x1 + 1, y1 - 1) << 3);

    return ((data >> pos) & 1) != 0;
}
#undef GET

void main() {
    vec3 color = vec3(0);
    float f = 0.;

    bool emit = false;
    // emit = emit || (texelFetch(bw, UV(0, -8 * (int(frame) / 8)), 0).r > 0.5) &&
    //    (int(frame) <= 4 * 8);
    // emit = emit || (UV() == ivec2(20, 39)) && (int(frame) % 3 == 0);
    // emit = emit || (UV() == ivec2(21, 39)) && (int(frame) % 9 == 0);
    // emit = emit || (UV() == ivec2(21, 39));
    // emit = emit || (UV().y == 0);
    int scale = 8;
    ivec2 a = ivec2(0, 10);
    // emit = emit || (texelFetch(bw, UV(a), 0).r > 0.5);
    f += texelFetch(bw, UV(a), 0).r;
    a += ivec2(round(mix(vec2(-scale, -scale), vec2(scale, scale), RAND().xz)));
    // emit = emit || (texelFetch(bw, UV(a), 0).r > 0.5);
    // f += texelFetch(bw, UV(a), 0).r * 0.1;
    // emit = emit || (UV() == ivec2(1, 2));
    // f += max(BUFFER(0, -1), BUFFER() - 0.25);
    // f += BUFFER(0, -1);
    f = clamp(f, 0., 1.);

    float decay = RAND().x;
    decay = pow(decay, 1.02);
    decay = mix(0.0, 0.01, decay);
    decay = 0.004;
    decay = clamp(decay, 0., 1.);

    // #define OP f +=
    //     RANDEVAL((-1, 0), BUFFER(-1, 0), 0., 0.);
    //     RANDEVAL((1, 0), 0., 0., BUFFER(1, 0));
    //     RANDEVAL((0, -1), 0., BUFFER(0, -1), 0.);
    // #undef OP

    int k = 0;
#define OP k =
    RANDEVAL((0, 1000), 1, 0, 0);
#undef OP
#define OP f +=
    RANDEVAL((0, 0), BUFFER(-1, 0), BUFFER(k, -1), BUFFER(1, 0));
#undef OP
    f = max(f, BUFFER(0, 0) * 0.5 - 0.004);
    // f = clamp(f - 0.1, 0., 1.);
    // f = mix(f, BUFFER(0, -1), 0.5);

    // f += float(emit);
    f -= decay;

    color = vec3(f);
    // color.rg = vec2(pos2x2 & 1, pos2x2 >> 1);
    // uvec2 SIZE = uvec2(textureSize(buffer, 0));
    // ivec2 pos = ivec2(frame % SIZE.x, (frame / SIZE.x) % SIZE.y);
    outColor = vec4(color, 1.);
}
