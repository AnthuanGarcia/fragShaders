#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

// pic[i][j] = uint8( (i^j) * (i&j) ) * 2

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= 2048.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col;

    ivec2 ij = ivec2(abs(uv));

    col = vec3( ( ij.x - (ij.x^ij.y)) );
    col /= vec3(ij.x^ij.y, ij.x|ij.y, ij.x&ij.y);

    fragColor = vec4(col, 1);

}