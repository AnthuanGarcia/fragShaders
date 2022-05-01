#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define ZOOM vec2(128)
#define MOD_INT(a, b) a - b*(a/b)

const float LIM = floor(sqrt(ZOOM.x));

float primePos(vec2 uv) {

    if ( all( lessThanEqual( uv, vec2(2) ) ) || all( equal( mod(uv, 2.0), vec2(0) ) ) ) {
        return any( equal(uv, vec2(2)) ) ? 1.0 : 0.0;
    }

    for (float i = 3.0; i <= LIM; i += 2.0) {

        if (any( equal( mod(uv, i), vec2(0) ) ))
            return 1.0;

    }

    return 0.0;

}

float primePos(float axis) {

    //ivec2 iuv = ivec2(uv);

    if ( axis <= 2.0 || mod(axis, 2.0) == 0.0 ) {
        return axis == 2.0 ? 1.0 : 0.0;
    }

    for (float i = 3.0; i <= LIM; i += 2.0) {

        if (mod(axis, i) == 0.0)
            return 0.0;

    }

    return 1.0;

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;
    uv *= ZOOM;
    
    float move = 16.0*u_time;
    uv = floor(uv + move);

    vec3 col;
    col += vec3(1) * primePos(uv);
    //col += vec3(1) * primePos(uv.y);
    //col += vec3(1) * primePos(uv.x);

    gl_FragColor = vec4(col, 1.0);

}