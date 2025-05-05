in vec2 outUV;  // 0 to 1

out vec4 outColor;

uniform sampler2D buffer;
uniform sampler2D gradient;

void main() {
    float f = texture(buffer, outUV).r;
    vec3 gradient_color = texture(gradient, vec2(f, 0.5)).rgb;
    outColor = vec4(gradient_color, 1.);
}
