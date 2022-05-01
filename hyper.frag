#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

#define sinh(x) ( exp(x) - exp(-x) ) * 0.5
#define DIFF(c) mix(vec3(1), vec3(0), c.x)

#define PI   3.14159265359

#define TILES 4.0
const float com = 1.0 / TILES;

float plot( vec2 st ) {

    return smoothstep(0.005, 0.0, abs(st.y * com));

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;

    uv *= TILES;
    uv -= TILES * 0.5;

    uv.x *= u_resolution.x / u_resolution.y;

    vec2 po = vec2(
        length(uv),
        atan(uv.x, uv.y)
    );

    //float t = u_time*0.05 + po.x * (0.1*sin(u_time));
    float t = u_time*0.5 + po.x;

    po.y /= PI;
    po.y += t;

    vec2 fpos = fract(po);

    vec3 col = vec3(0.5 * sin(0.5*u_time) + 0.5);

    col -= plot(fpos) * DIFF(po);
    col -= plot(fpos - 0.25) * DIFF(po);
    col -= plot(fpos - 0.5) * DIFF(po);
    col -= plot(fpos - 0.75) * DIFF(po);
    col -= plot(fpos - 1.0) * DIFF(po);

    gl_FragColor = vec4(col, 1);

}