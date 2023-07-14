// const vec3 vertices[3] =
//     vec3[3](vec3(-0.5f, -0.5f, 0.0f), vec3(0.5f, -0.5f, 0.0f), vec3(0.0f, 0.5f, 0.0f));

// const vec3 uvs[3] =
//     vec3[3](vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0));

in vec2 pos;

out vec2 outUV;
out vec3 color;
flat out int indexID;

void main() {
    // gl_Position = vec4(vertices[gl_VertexID], 1.0);
    // outUV = uvs[gl_VertexID];

    gl_Position = vec4(pos * 0.8, 0.0, 1.0);
    color = rand3(pos);
    outUV = pos;
    indexID = gl_VertexID;
}
