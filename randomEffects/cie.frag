#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define TRIST mat3( 0.49000, 0.31000, 0.20000, 0.17697, 0.82140, 0.01063, 0.00000, 0.01000, 0.99000)

vec3 trist(vec3 rgb) {

    return 1.0/0.17697 * mat3(
        0.49000, 0.31000, 0.20000,
        0.17697, 0.82140, 0.01063,
        0.00000, 0.01000, 0.99000
    ) * rgb;

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;

    vec3 col = trist(vec3(2, 10, -10));

    vec3 chroma = col / dot(col, vec3(1, 15, 3));

    fragColor = vec4(chroma.xy, 0, 1);

}
