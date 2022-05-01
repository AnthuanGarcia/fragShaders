#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define ZOOM 3.0
#define THICK 0.015

const float com = 1.0 / ZOOM;

float plot(float st, float thickness) {

    return smoothstep(thickness, 0.0, abs(st * com));

}

void main() {

    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;

    uv *= ZOOM;

    float cancel_top = step(-ZOOM, uv.x) * step(1.5, -uv.y);
    float cancel_bot = step(-ZOOM, uv.x) * step(-1.5, uv.y);

    uv.x *= u_resolution.x / u_resolution.y;

    float t = .5 * sin(u_time);

    float middle = floor(
        mod(uv.y * com + 0.5, 2.0)
    );

    float back = floor(
        mod(uv.y * com + 1.5, 2.0)
    );

    vec2 grid = tan(uv + 1.25*u_time);
    
    uv /= length( uv ) - 2.25;

    vec3 col = vec3(0);

    vec2 p1 = vec2(0.0), p2 = vec2(cos(u_time), sin(u_time)); 

    //p1 *= ZOOM;
    //p2 *= ZOOM;

    float m = (p1.y - p2.y) / (p1.x - p2.x);
    float b = p1.y - m*p1.x;

    uv.y -= m*uv.x + b;
    uv.y += t*10.0;

    uv.y = fract(uv.y);
    grid = 1.2*tan(2.50*grid);

    col -= plot( grid.y, THICK ) * sign(back - 1.0) * cancel_bot;
    col -= plot( grid.x, THICK ) * sign(back - 1.0) * cancel_top;

    //col -= plot(uv.y,        THICK) * sign(middle - 1.0);
    col -= plot(uv.y - 0.50, THICK) * sign(middle - 1.0);

    gl_FragColor = vec4(col, 1.0);

}