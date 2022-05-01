#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define CIRCLE(r, p) length(p) - abs(r)
#define SQUARE(l, p) max(p.x, p.y) - l
#define GLOW(r, d, i) pow(r/(d), i)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    //uv -= 0.5;
    uv *= 4.0;

    vec3 col;

    //col += plot( abs(SQUARE(0.2, abs(uv))), 0.002 );
    //col += plot( abs(CIRCLE(0.2, uv - vec2(0, 0.2))) , 0.002 );
    vec2 absuv = abs(uv);
    float t = 1.5*sin(u_time) + 1.5;

    float a = plot(
        abs( (max(absuv.x, absuv.y) / (1.0/cos(cos(uv.x*uv.y))) ) - t ),
        0.025
    );

    col += a;

    //col = 1.0 - exp( -col );

    fragColor = vec4(col, 1);

}
