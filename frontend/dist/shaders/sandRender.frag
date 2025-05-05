in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform sampler2D buffer;

void main() {
    outColor = vec4(texture(buffer, outUV).rgb, 1.);
}
