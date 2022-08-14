#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.y;
    uv -= 0.15;
    uv *= 8.0;

    vec4 col = vec4(0, 0, 0, 1);

    mat2x3 shear = mat2x3(
        1, 0, sin(u_time),
        0, 1, cos(u_time)
    );

    uv.x += u_time;

    vec2 fpos = fract(uv);
    vec2 fposdis = fract(vec3(uv, 1) * shear);

    float normalGrid = plot(fpos.x, 0.05) + plot(fpos.y, 0.05);
    float distordedGrid = plot(fposdis.x, 0.05) + plot(fposdis.y, 0.05);

    col = mix(col, vec4(1, 0, 0, 0.5), distordedGrid);
    col = mix(col, vec4(1), normalGrid);

    fragColor = col;

}