#ifdef GL_ES
precision mediump float;
#endif

#define PI   3.14159265359
#define PI_2 6.28318530718

//#define TILES  1.0
#define PETALS 5.0
#define NOISE(p) fract(sin(p.x * 10.0 + p.y * 1234.5) * 4357.1234)

//#define EVEN_ODD(v) mod(v.x + v.y, 2.0)
//const float invTiles = 1.0 / TILES;

uniform vec2 u_resolution;
uniform float u_time;

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);

    // --- POLAR COORDINATES (FLOWER) --- //

    /*  coordenada polar: (r, θ)
        r: Distancia con respecto al origen = sqrt( x^2 + y^2 )
        θ: Angulo en sentido contrario de las manecillas del reloj (izquierda)
    */
    vec2 st = vec2(
        length(uv),
        atan(uv.y, uv.x)
    );

    float t = u_time*0.05 + st.x * (0.1*sin(u_time));
    st.y /= PI_2;
    st.y -= t + 0.5;

    float y = st.y*PETALS;
    float m = min(fract(y), fract(1.0 - y));
    float offset = 0.25;
    float amplifier = 0.5;
    float c = smoothstep(0.0, 0.1, m * amplifier + offset - st.x);

    //col += vec3(c*c, 2.0*c*c, c) * id;
    col -= vec3(c, 2.0*c, 1) * c;
    //col -= vec3(c*c, 2.0*c*c, c) * foo3;
    //col -= vec3(c*c, 2.0*c*c, c) * foo4;

    gl_FragColor = vec4(col, 1.0);
}