#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define BLUE vec3(0.0, 0.5, 1.0)
#define PINK vec3(1.0, 0.0, 0.45)
#define GREEN vec3(0.0, 1.0, 0.6667)
#define ORANGE vec3(1.0, 0.7, 0.0)
#define ROSE vec3(0.97, 0.62, 0.95)
#define PURPLE vec3(0.4, 0.0, 1.0)
#define RED vec3(1, 0, 0)

#define GRAD(a, b) mix(a, b, uv.x*1.5)

float plot(vec2 st) {

    return smoothstep(0.005, 0.0, (st.y));

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 mou = u_mouse/u_resolution - 0.5;

    //uv *= ZOOM;
    //mou *= ZOOM;
    //uv -= ZOOM*0.5;

    vec3 col;

    float t = u_time * 1.5;

    vec2 p1 = vec2(0);
    vec2 p2 = vec2(
        cos(uv.x - t) + 4.0,
        1.5*sin(10.0*uv.y + t)
    );

    float m = (p1.y - p2.y) / (p1.x - p2.x);
    float b = p1.y - m*p1.x;

    uv.y -= m*uv.x + b;

    float limit = step(uv.x, p2.x) * 0.15;

    col += plot(uv)        * limit * GRAD( ORANGE, PINK );

    col += plot(uv - 0.15) * limit * GRAD( PURPLE, RED );
    col += plot(uv + 0.15) * limit * GRAD( ROSE,   BLUE );

    col += plot(uv - 0.30) * limit * GRAD( GREEN,  PINK );
    col += plot(uv + 0.30) * limit * GRAD( RED,    PURPLE );

    col += plot(uv - 0.45) * limit * GRAD( ORANGE, PINK );
    col += plot(uv + 0.45) * limit * GRAD( PINK,   ROSE );
    
    col += plot(uv - 0.6)  * limit * GRAD( ORANGE, GREEN );
    col += plot(uv + 0.6)  * limit * GRAD( RED,    PURPLE );


    gl_FragColor = vec4(col, 1.0);

}