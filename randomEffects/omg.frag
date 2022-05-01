#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define GLOW(r, d, i) pow(r/(d), i)

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);

    vec2 move = vec2(0.075*sin(0.015*u_time)+0.075, 0.075*cos(0.15*u_time)+0.075);

    for(float i = 1.0; i <= 8.0; i++) {

        uv.y -= 0.8/i * sin(i*uv.x*uv.x + u_time)     + move.y;
        uv.x -= 1.0/i * cos(i*3.0*uv.y*uv.y + u_time) + move.x;

    }

    float d = abs(uv.y);

    vec3 a = mix(vec3(0.87, 1, 0), vec3(1), uv.x);
    a = mix(a, vec3(0.89, 0.75, 0), uv.x);

    col -= GLOW(0.3, d, 0.8) * a;

    fragColor = vec4(col, 1);

}