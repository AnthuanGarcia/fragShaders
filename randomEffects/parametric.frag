#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Parametrics
#define PARAMETRIC(a, b, k_x, k_y, t) vec2( a*cos(k_x*t), b*sin(k_y*t) )
#define POINTS   32
#define DIST_PTS 0.01
#define NUM_PARA 2

#define PI   3.14159265359
#define ZOOM 3.0
#define NUM_TILES vec2(1.0)

float parametric[NUM_PARA];
const float ZOOM_RECIPROCAL = 1.0/ZOOM;
mat2 rotate90 = mat2(
    0, 1, 
    -1, 0
);

float plot(float st, float thickness) {

    return smoothstep(thickness, 0.0, abs(st * ZOOM_RECIPROCAL));

}

void trace(vec2 p, float t) {

    //float d = 1e10;
    parametric[0] = 
    parametric[1] = ZOOM;

    float e = 0.0;

    for (int i = 1; i < POINTS; i++) {

        /*d = min(
            d,
            distance( p, PARAMETRIC( 1.0, 1.0, 3.0, 8.0, t*e) )
        );*/

        /*parametric[0] = min(
            parametric[0], 
            distance( p, PARAMETRIC( 1.0, 1.0, 3.0, 8.0, t*e) )
        );

        parametric[1] = min(
            parametric[1], 
            distance( p, PARAMETRIC( 1.0, 1.0, 4.0, 8.0, t*e) )
        );*/

        parametric[0] = min(
            parametric[0],
            distance(
                p,
                PARAMETRIC( 2.0*PI, ZOOM, 3.0, 8.0, t*e)
            )
        );

        parametric[1] = min(
            parametric[1],
            distance(
                (p ),
                PARAMETRIC( 2.0*PI, ZOOM, 4.0, 8.0, t*e)
            )
        );

        e += DIST_PTS;

    }

    //return d;

}

void main() {

    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    vec2 ipos = floor(uv * NUM_TILES);

    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    float tiles = mod(
        (ipos.y + ipos.x), 2.0
    );

    //vec2 axis = uv;
    vec3 col = vec3(tiles);

    float period = sin(0.085*u_time);
    float t = 2.0*PI * period;

    trace(uv, t);
    //for (int i = 0; i < NUM_PARA; i++)
    col -= plot( parametric[0], 0.015 ) * sign(tiles - 0.5);
    col -= plot( parametric[1], 0.015 ) * sign(tiles - 0.5);

    //col -= (plot(axis.y, 0.025) + plot(axis.x, 0.025)) * vec3(1);

    gl_FragColor = vec4(col, 1.0);

}