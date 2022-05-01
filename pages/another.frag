#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define SIZE 12

float lines[SIZE] = float[SIZE](
    1.2, 1.4, 1.6, 1.8,
    2.0, 2.2, 2.4, 2.6,
    2.8, 3.0, 3.2, 3.4
);

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= 15.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col;

    float t = 2.0*sin(u_time);

    for(int i = 0; i < SIZE; i++) {

        vec2 auv = uv;

        auv.y -= lines[i]*t*sin(0.5*auv.x + u_time);

        col += plot( abs(auv.y), 0.025 );

    }

    uv.y -= t*sin(0.5*uv.x + u_time);
    col += plot( abs(uv.y), 0.025 );

    fragColor = vec4(col, 1);

}