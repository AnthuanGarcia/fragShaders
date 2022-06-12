#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PARAMETRIC(a, b, k_x, k_y, t) vec2( a*cos(k_x*t), b*sin(k_y*t) )
#define POINTS   128
#define DIST_PTS 0.01

#define TWO_PI 6.28318530718
#define ZOOM 3.0

float plot(float st, float thickness) {

    return smoothstep(thickness, 0.0, abs(st));

}

vec3 trace(vec2 p, float t) {

    vec3 parametrics = vec3(1e10);
    float e = 0.0;

    for (int i = 0; i < POINTS; i++) {

        parametrics[0] = min(
            parametrics[0],
            distance(
                p - 0.25,
                PARAMETRIC( 1.0, 1.0, 3.0, 8.0, t*e)
            )
        );

        parametrics[1] = min(
            parametrics[1],
            distance(
                p,
                PARAMETRIC( 1.0, 1.0, 5.0, 7.0, t*e)
            )
        );

        parametrics[2] = min(
            parametrics[2],
            distance(
                p + 0.25,
                PARAMETRIC( 1.0, 1.0, 4.0, 9.0, t*e)
            )
        );


        e += DIST_PTS;

    }

    return parametrics;

}

void main() {

    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0);

    float square = step(-1.105, -abs(uv.x)) * step(-1.105, -abs(uv.y));

    float period = sin(0.095*u_time);
    float t = TWO_PI * period;

    float on = smoothstep(0.9996, 1.0, abs(period));

    col += on*square;

    if ( all( lessThanEqual(abs(uv), vec2(1.5)) ) ) {

        vec3 param = trace(uv, t);

        on = -2.0*on + 1.0;

        col += (plot( param[0], 0.03 ) +
                plot( param[1], 0.03 ) +
                plot( param[2], 0.03 )) * on;

    }

    gl_FragColor = vec4(col, 1.0);

}