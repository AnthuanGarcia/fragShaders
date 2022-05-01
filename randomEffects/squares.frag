#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define SQUARE(l, p) max(p.x, p.y) - l
#define GLOW(r, d, i) pow(r/(d), i)

#define FST_COL vec3(1)
#define SND_COL vec3(0.5725, 0.5882, 0.9216)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

vec2 fire(vec2 uv) {

    for (float i = 1.0; i < 8.0; i++) {

        uv.x += 0.5/i * sin(3.0*i*uv.y + u_time*0.5) + u_time*0.01;
        uv.y -= 0.5/i * cos(3.0*i*uv.x + u_time*0.5);

    }

    return uv;

}

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 mou = 2.0*(u_mouse / u_resolution)-1.0;
    mou.x *= u_resolution.x / u_resolution.y;
    vec3 col = vec3(1);

    vec2 f = fire(uv);

    //f.y -= 0.9*cos(2.0*u_time) * f.x;

    float squares = plot( ( SQUARE(0.65, abs(uv)) ), 0.008);
    vec3 grad = mix(FST_COL, SND_COL, uv.y + 0.5);

    col = mix(col, grad, squares - f.y);

    fragColor = vec4(col, 1);

}