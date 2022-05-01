#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define GLOW(r, d, i) pow(r/(d), i)

// pic[i][j] = uint8( (i^j) * (i&j) ) * 2

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= 256.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col;

    ivec2 ij = ivec2(abs(uv));

    for(int i = 1; i <= 3; i++) {

        for(int j = 1; j <= 3; j++) {

            col = vec3(  ij.y*i & ij.x*j ) * GLOW(0.35, abs(uv.y), 1.0);

        }

    }

    fragColor = vec4(col, 1);

}