#ifdef GL_ES
precision mediump float;
#endif

#define TIMES 3
#define PI 3.1415926538

uniform vec2 u_resolution;
uniform float u_time;

// in - Read
// out - Write
// inout - Read/Write (Reference/Pointer)

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
    float amp   = 0.5;
    vec2 shift  = vec2(10);

    for (int i = 0; i < TIMES; i++) {

        value += amp * abs(smoothNoise(st));
        st = st * 2.0 + shift;
        amp *= 0.5;

    }

    return value;

}

void main() {

    vec2 st = gl_FragCoord.xy / u_resolution;
    st.x *= u_resolution.x / u_resolution.y;

    vec3 col;

    vec2 xx, yy;

    xx.x = fbm(st);
    xx.y = fbm(st + vec2(1));

    yy.x = fbm(st + xx + 0.1 * u_time);
    yy.y = fbm(st + xx + 0.15 * u_time);

    vec2 temp = st + xx + yy;
    float val = fbm(temp);

    col = mix(vec3(0.0902, 0.4471, 0.4157), vec3(0.1804, 0.1412, 0.5412), clamp(val * val, 0.0, 1.0));
    col = mix(col, vec3(0.4745, 0.1216, 0.4745), clamp(length(xx - yy), 0.0, 1.0));
    col += fbm(xx * yy * 32.0);
    col += smoothstep(0.2 + 0.1*sin(u_time), 0.5, smoothNoise(xx * yy * 4.0));

    gl_FragColor = vec4(col, 1);
}