in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform sampler2D mytex;

void main() {
    vec3 color = vec3(0);

    float texout = texture(mytex, outUV).r;
    color.xyz = vec3(texout);

    outColor = vec4(color, 1.);
}
