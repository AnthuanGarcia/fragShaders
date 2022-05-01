#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define POINTS 9
#define ZOOM 6.0

#define EVEN_ODD(v) mod( v.x , 2.0)

vec2 points[POINTS];

const float com = 1.0 / ZOOM;

float plot(float st) {
    
    return smoothstep(0.005, 0.0, abs(st * com));

}

void main() {

    vec2 uv  = 2.0*(gl_FragCoord.xy/u_resolution) - 1.0;
    vec2 mou = 2.0*(u_mouse/u_resolution) - 1.0;

    uv  *= ZOOM;
    mou *= ZOOM;

    uv.x  *= u_resolution.x / u_resolution.y;
    mou.x *= u_resolution.x / u_resolution.y;

    float tiles = EVEN_ODD(
        floor( uv * com * 0.1 )
    );

    vec3 col = vec3(tiles);

    points[0] = vec2(0);
    points[1] = vec2(0, 1.0);
    points[2] = vec2(0, -1.0);
    points[3] = vec2(1.0, 0);
    points[4] = vec2(-1.0, 0);
    points[5] = vec2(1.0, 1.0);
    points[6] = vec2(1.0, -1.0);
    points[7] = vec2(-1.0, 1.0);
    points[8] = vec2(-1.0, -1.0);

    for(int i = 0; i < POINTS; i++) {

        points[i]   *= ZOOM;
        points[i].x *= u_resolution.x / u_resolution.y;

        float m = (points[i].y - mou.y) / (points[i].x - mou.x);
        float b = points[i].y - m*points[i].x;

        vec2 uvs = uv;

        uvs.y -= m*uvs.x + b;
        col   -= plot(uvs.y) * sign(tiles - 0.5);

    }

    vec2 grid = tan(uv + 1.25*u_time);
    col -= ( plot(cos(grid.x)) + plot(sin(grid.y)) ) * sign(tiles - 0.5);

    gl_FragColor = vec4(col, 1.0);

}