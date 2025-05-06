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

    bool emit = false;
    emit = emit || (texelFetch(bw, UV(0, -60 * (int(frame) / 8)), 0).r > 0.5) &&
                       (int(frame) <= 4 * 8);
    // emit = emit || (UV() == ivec2(20, 39)) && (int(frame) % 3 == 0);
    emit = emit || (UV() == ivec2(21, 39)) && (int(frame) % 5 == 0);
    // emit = emit || (UV() == ivec2(1, 2));
    // f += max(BUFFER(0, -1), BUFFER() - 0.25);
    // f += BUFFER(0, -1);

    float decay = RAND().x;
    decay = max(0., min(1., decay));
    decay = pow(decay, 1.02);
    decay = mix(0.0, 0.01, decay);
    // decay = 0.02;

    // #define OP f +=
    //     RANDEVAL((-1, 0), BUFFER(-1, 0), 0., 0.);
    //     RANDEVAL((1, 0), 0., 0., BUFFER(1, 0));
    //     RANDEVAL((0, -1), 0., BUFFER(0, -1), 0.);
    // #undef OP

#define GET(X, Y) ((BUFFER(X, Y) > 0.5) || (UV(X, Y).y < 2))

    bool b = false;
    // b = b || GET(0, 0);
    // b = b && !(GET(0, -1) || GET(-1, -1) || GET(1, -1));  // we fall down
    b = b || (GET(0, 1));               // above falls into us
    b = b || (GET(1, 1) && GET(1, 0));  // top right falls into us
    // b = b || (GET(-1, 1) && !GET(-2, 0) && !GET(-1, 0));  // top left falls into us

    int iframe = int(frame);
    // int pos2x2 = (UV().x & 1) & (((UV().y & 1) ^ (frame & 1)) << 1);
    // int pos2x2 = \
    //   ((UX.x & 1) ^ \
    //   (frame & 1)) | \
    //   (((UV.y << 1) & 2) ^ ((frame + 1) & 2)

#undef GET
#define GET(P) (int((BUFFER(P) > 0.5) || UV(P).y <= 0))

    // iframe = 3;
    int pos2x2 = ((UV().x ^ iframe) & 1) | (((UV().y << 1) ^ (iframe + 1)) & 2);
    int data = (int[](41088, 51200, 65274, 65516))[pos2x2];

    ivec2 TL = ivec2((int[](0, -1, 0, -1))[pos2x2], (int[](0, 0, 1, 1))[pos2x2]);
    ivec2 TR = ivec2((int[](1, 0, 1, 0))[pos2x2], (int[](0, 0, 1, 1))[pos2x2]);
    ivec2 BL = ivec2((int[](0, -1, 0, -1))[pos2x2], (int[](-1, -1, 0, 0))[pos2x2]);
    ivec2 BR = ivec2((int[](1, 0, 1, 0))[pos2x2], (int[](-1, -1, 0, 0))[pos2x2]);

    int pos = GET(TL) | (GET(TR) << 1) | (GET(BL) << 2) | (GET(BR) << 3);
    b = ((data >> pos) & 1) != 0;

    b = b || emit;
    f = float(b);
    // f = max(emit, f);
    // f -= decay;

    color = vec3(f);
    // color.rg = vec2(BR) * 0.5 + 0.5;
    // if ((int(frame) / 200) % 2 == 0) {
    //     color.r = 0.;
    // } else {
    //     // color.r = 0.;
    //     color.g = 0.;
    // }
    // color.rg = vec2(pos2x2 & 1, pos2x2 >> 1);
    // uvec2 SIZE = uvec2(textureSize(buffer, 0));
    // ivec2 pos = ivec2(frame % SIZE.x, (frame / SIZE.x) % SIZE.y);
    outColor = vec4(color, 1.);
}
