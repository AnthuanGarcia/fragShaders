#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define ZOOM vec2(25)
#define TIMES 3

#define AND(a) mod(a.x*a.y, 2.0)
#define XOR(a) mod(a.x+a.y, 2.0)
#define NEG(a) mod(9.0 - a.x, 2.0)
#define OR(a) mod(1.0 - (1.0 - a.x)*(1.0 - a.y), 2.0)


float and(vec2 p) {

    return mod(121.0*p.y, p.x);

}

float and(vec2 p, float move) {

    //p.x -= floor(ZOOM.x);
    p.y += move;

    //return mod( mod(121.0*p.x, 1024.0), p.y+1.0);
    return mod(121.0*p.x, p.y);
}

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

    vec2 uv = gl_FragCoord.xy / u_resolution;
    //uv.x -= 0.5;
    //uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);

    vec2 ipos = floor(uv * ZOOM);
    //float move = floor(7.0*sin(u_time) + 8.0);

    vec2 xandy = vec2(and(ipos));

    vec2 xx, yy;

    xx.x = fbm(uv);
    xx.y = fbm(xandy);

    yy.x = fbm(uv + xx + 0.1 * u_time);
    yy.y = fbm(xandy + xx + 0.15 * u_time);

    col = mix(vec3(0.87, 1.0, 0.0), vec3(01., 0.0, 01.0), length(xx));
    col = mix(col, vec3(0.0157, 0.4941, 0.3333), length(yy));
    col += fbm(xx * yy * 15.0);

    //col /= vec3(and(uv)) * 10.5;

    gl_FragColor = vec4(col, 1.0);

}

// OMG
// pic[i][j] = uint8( (i^j) * (i&j) ) * 2