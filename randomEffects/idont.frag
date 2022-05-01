#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define WEIRD_GRID(i) mod(20.0*i.x*i.y, i.y)

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0);

    vec2 ipos = floor(uv * 256.0);
    vec2 ipos2, ipos3;

    float move = floor(3.0*sin(3.5*u_time));
    ipos2 = ipos3 = ipos;

    ipos  += move;
    ipos3 -= move;

    col += vec3(1, 0, 0.5) * WEIRD_GRID(ipos);
    col += vec3(0, 1, 0) * WEIRD_GRID(ipos2);
    col += vec3(0, 0, 1) * WEIRD_GRID(ipos3);

    gl_FragColor = vec4(col, 1.0);

}