#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 15.0
#define THICKNESS 0.025

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define GLOW(r, d, i) pow(r/(d), i)
#define WAVE(fm, p) sin(fm*p.x + 0.75*u_time)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);
    //return smoothstep(0.09, 0.0, p);
}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0);
    vec3 lineCol = vec3(1, 1, 2);

    float t = 2.0*sin(u_time);

    for(float i = 1.0; i < 3.5; i += 0.2) {

        vec2 auv = uv;
        auv.y += i*t*WAVE(0.35, uv);
        col = mix(col, lineCol, plot( abs(auv.y), THICKNESS ));

    }

    uv.y += t*WAVE(0.35, uv);
    col = mix(col, lineCol, GLOW(0.075, abs(uv.y), 0.95));

    //col = 1.0 - exp( -col );

    fragColor = vec4(col, 1);

}