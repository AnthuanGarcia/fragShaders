#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 12.0
#define GLOW(r, d, i) pow(r/(d), i)

mat2 rot2D(float angle, float clock) {

    float s = sin(angle);
    float c = cos(angle);

    return mat2(
        c, clock*s,
        -clock*s, c
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 mou = (u_mouse / u_resolution - 0.5) * ZOOM;
    mou.x *= u_resolution.x / u_resolution.y;

    float t = 0.075;

    uv += mou;

    float p = sin(0.5*u_time);
    float shake = 2.0*(smoothstep(0.0, 1., abs(p) ) - 0.3);

    uv.y += sin(uv.x + u_time) + shake;
    uv.x += 0.15*cos(uv.y*shake + 5.0*u_time);

    uv *= rot2D(length(uv) * t, 1.0);
    uv = fract(uv);
    vec2 uv2 = fract(-uv);

    vec3 col;

    col = mix(
        vec3(0),
        vec3(1.5),
        GLOW(0.01, uv.y, 0.9) + GLOW(0.01, uv2.y, 0.9) +
        GLOW(0.01, uv.x, 0.9) + GLOW(0.01, uv2.x, 0.9)
    );

    fragColor = vec4(col, 1);

}