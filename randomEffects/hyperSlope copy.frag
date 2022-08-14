#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 3.0
#define THICK 0.025
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

const float com = 1.0/ZOOM;

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (1.5 + ZOOM), t + RX * (1.5+ZOOM), p);

}

/* Fabrice12 */

float aafract(float x) {    // --- antialiased fract
    float v = fract(x),
          w = fwidth(x);    // NB: x must not be discontinuous or factor discont out
    return v < 1.-w ? v/(1.-w) : (1.-v)/w; // replace right step by down slope (-> chainsaw is continuous).
            // shortened slope : added downslope near v=1 
}
float aastep(float x) {     // --- antialiased step(.5)
    float w = fwidth(x);    // pixel width. NB: x must not be discontinuous or factor discont out
    return smoothstep(.7,-.7,(abs(fract(x-.25)-.5)-.25)/w); // just use (offseted) smooth squares
}
/* ----- */

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

    col -= plot( abs(grid.y), THICK ) * sign(back - 1.0) * cancel_bot;
    col -= plot( abs(grid.x), THICK ) * sign(back - 1.0) * cancel_top;

    //col -= plot(uv.y,        THICK) * sign(middle - 1.0);
    col -= plot(abs(uv.y - 0.50), THICK) * sign(middle - 1.0);

    fragColor = vec4(col, 1.0);

}