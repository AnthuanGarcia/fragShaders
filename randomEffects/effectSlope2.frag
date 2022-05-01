#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define BLACK vec3(1.0, 1.0, 1.0)
#define WHITE vec3(0.0, 0.0, 0.0)

#define GRAD(a, b) mix(a, b, uv.x*1000.0)

float plot(vec2 st) {

    return smoothstep(0.005, 0.0, abs(st.y));

}

void main() {

    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv *= 0.65;
    uv.x *= u_resolution.x / u_resolution.y;

    //mou *= ZOOM;
    //uv -= ZOOM*0.5;

    vec3 col = vec3(0);

    float t = u_time * 1.5;

    vec2 p1 = vec2(0);
    vec2 p2 = vec2(
        cos(uv.x - t) + 5.0,
        1.5*sin(10.0*uv.y + t) + 3.
    );

    float m = (p1.y - p2.y) / (p1.x - p2.x);
    float b = p1.y - m*p1.x;

    uv.y -= m*uv.x + b;

    float limit = step(uv.x, p2.x);

    col -= plot(uv)        * limit * GRAD( BLACK, WHITE );
    col -= plot(uv - 0.15) * limit * GRAD( WHITE, BLACK);
    col -= plot(uv + 0.15) * limit * GRAD( WHITE, BLACK);
    col -= plot(uv - 0.30) * limit * GRAD( BLACK, WHITE );
    col -= plot(uv + 0.30) * limit * GRAD( BLACK, WHITE );
    col -= plot(uv - 0.45) * limit * GRAD( WHITE, BLACK );
    col -= plot(uv + 0.45) * limit * GRAD( WHITE, BLACK );
    col -= plot(uv - 0.6)  * limit * GRAD( BLACK, WHITE );
    col -= plot(uv + 0.6)  * limit * GRAD( BLACK, WHITE );

    col.r += 1.0;
    col.b += 1.0;
    col.g += 0.68;

    gl_FragColor = vec4(col, 1.0);

}