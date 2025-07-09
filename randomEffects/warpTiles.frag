#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 20.0
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (1.5 + ZOOM), t + RX * (1.5 + ZOOM), p);

}

float aastep(float threshold, float value) {

    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);

}

mat2 rot2D(float angle, float clock) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, clock*s,
        -clock*s, c
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.y - 0.5;
    uv *= ZOOM;

    uv.x += 0.5*sin(uv.y + u_time);
    uv.y -= 0.5*cos(uv.x + u_time) + 10.0*sin(0.1*u_time);

    uv *= rot2D( length(uv) * 0.1, 1.0);
    uv *= rot2D(0.15*u_time, 0.0);

    vec2 fpos = fract(uv);

    vec3 col;

    col += aastep( 0.5, fpos.y);

    fragColor = vec4(col, 1);

}
