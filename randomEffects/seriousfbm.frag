#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define TIMES 4

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

float fbm(in vec2 st) {

    float value = 0.0;
    float amp   = 0.45;
    vec2 shift  = vec2(10);

    for (int i = 0; i < TIMES; i++) {

        value += amp * smoothNoise(st);
        st = st * 3.0 + shift;
        amp *= 0.45;

    }

    return value;

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 sincost = vec2(cos(0.5*u_time), sin(0.5*u_time));

    mat2 rot = mat2(
        sincost[0], sincost[1],
       -sincost[1], sincost[0]
    );

    vec2 xx, yy;

    uv *= rot;

    xx.x = fbm(uv + 0.5*u_time);
    xx.y = fbm(uv + 0.05*u_time);

    xx.x += fbm(xx + 0.015*u_time);
    xx.y += fbm(xx + u_time);

    yy.x = fbm(xx + 0.5*u_time);
    yy.y = fbm(xx + 0.05*u_time);

    yy.x += fbm(yy + 0.015*u_time);
    yy.y += fbm(yy + u_time);

    vec3 col;

    col.gb += fbm((xx + yy) * 10.0);
    col.rb += dot(xx, xx*0.5);
    col.rg += dot(yy, yy*0.5);

    gl_FragColor = vec4(col, 1.0);

}