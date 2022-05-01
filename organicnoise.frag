#ifdef GL_ES
precision mediump float;
#endif

#define TIMES 3

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

        value += amp * smoothNoise(st);
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

    col = mix(vec3(0.1255, 0.6392, 0.5961), vec3(0.1804, 0.1412, 0.5412), length(xx));
    col = mix(col, vec3(0.5529, 0.0745, 0.5529), length(yy));
    col += fbm(xx * yy * 15.0);

    gl_FragColor = vec4(col, 1);
}