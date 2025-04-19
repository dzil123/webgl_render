out vec2 outUV;

// https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/
void main() {
    outUV = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(outUV * 2.0f + -1.0f, 0.0f, 1.0f) * 0.1;
}
