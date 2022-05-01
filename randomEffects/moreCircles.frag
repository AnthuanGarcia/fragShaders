#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define CIRCLE(r, p) step(r, -dot(p, p))
#define CIRCLE2(r, p) length(p) - abs(r)

#define LEFT(p)  step(0.0, p.x)
#define RIGHT(p) step(0.0, -p.x)

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float circles[7];

#define GREEN     vec4(.78, .76, .64, 0.5)
#define BLK_GREEN vec4(.78, .72, .61, 0.5)
#define RED       vec4(.77, .38, .34, 0.5)
#define RED_LGT   vec4(.77, .28, .27, 0.5)
#define RED_DRK   vec4(.7,   .5, .44, 0.5)
#define RED_ORA   vec4(.67, .19, .29, 0.5)

float noise_1(vec2 st) {

    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );

}

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void outLineCirc(vec2 p) {

    float aux = 0.0;

    for (int i = 0; i < 16; i++) {

        //float rndMov = noise_1(vec2(i));

        circles[0] += plot(
            abs(CIRCLE2(aux, p - vec2(0, 0.3))),
            0.001
        ) * RIGHT(p);

        circles[1] += plot(
            abs(CIRCLE2(aux, p - vec2(0, 0.15))),
            0.001
        ) * LEFT(p);

        circles[2] += plot(
            abs(CIRCLE2(aux, p + vec2(0, 0.4))),
            0.001
        ) * RIGHT(p);

        circles[3] += plot(
            abs(CIRCLE2(aux, p + vec2(0, 0.15))),
            0.001
        ) * RIGHT(p);

        circles[4] += plot(
            abs(CIRCLE2(aux, p + vec2(0, 0.2))),
            0.001
        ) * LEFT(p);

        circles[5] += plot(
            abs(CIRCLE2(aux, p - vec2(0, 0.55))),
            0.001
        ) * LEFT(p);

        circles[6] += plot(
            abs(CIRCLE2(aux, p + vec2(0, 0.57))),
            0.001
        ) * LEFT(p);

        aux += 0.01;

    }


}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    //vec3 col = vec3(0.97, 0.95, 0.91);
    vec4 col = vec4(0.97, 0.95, 0.91, 1.0);

    vec4 bigCir = plot(
        CIRCLE2(0.3, uv),
        0.0
    ) * LEFT(uv) * RED;

    vec4 bigCir2 = plot(
        CIRCLE2(0.2, uv - vec2(0, 0.5)),
        0.0
    ) * RIGHT(uv) * BLK_GREEN;

    vec4 bigCir3 = plot(
        CIRCLE2(0.4, uv + vec2(0, 0.45)),
        0.0
    ) * LEFT(uv) * RED_LGT;

    vec4 bigCir4 = plot(
        CIRCLE2(0.2, uv + vec2(0, 0.05)),
        0.0
    ) * RIGHT(uv) * RED;

    vec4 bigCir5 = plot(
        CIRCLE2(0.35, uv - vec2(0, 0.55)),
        0.0
    ) * LEFT(uv) * GREEN;

    vec4 bigCir6 = plot(
        CIRCLE2(0.15, uv + vec2(0, 0.25)),
        0.0
    ) * RIGHT(uv) * RED_DRK;

    vec4 bigCir7 = plot(
        CIRCLE2(0.25, uv + vec2(0, 0.55)),
        0.0
    ) * RIGHT(uv) * RED_ORA;

    vec4 bigCir8 = plot(
        CIRCLE2(0.28, uv - vec2(0, 0.15)),
        0.0
    ) * RIGHT(uv) * GREEN;

    vec4 bigCir9 = plot(
        CIRCLE2(0.15, uv),
        0.0
    ) * LEFT(uv) * RED_LGT;

    outLineCirc(uv);

    col = mix(col, circles[0] * GREEN    , circles[0]*0.5);
    col = mix(col, circles[1] * RED      , circles[1]*0.5);
    col = mix(col, circles[2] * RED_DRK  , circles[2]*0.5);
    col = mix(col, circles[3] * RED_LGT  , circles[3]*0.5);
    col = mix(col, circles[4] * RED_DRK  , circles[4]*0.5);
    col = mix(col, circles[5] * BLK_GREEN, circles[5]*0.5);
    col = mix(col, circles[6] * RED_ORA  , circles[6]*0.5);

    col = mix(col, bigCir,  bigCir.a);
    col = mix(col, bigCir2, bigCir2.a);
    col = mix(col, bigCir3, bigCir3.a);
    col = mix(col, bigCir4, bigCir4.a);
    col = mix(col, bigCir5, bigCir5.a);
    col = mix(col, bigCir6, bigCir6.a);
    col = mix(col, bigCir7, bigCir7.a);
    col = mix(col, bigCir8, bigCir8.a);
    col = mix(col, bigCir9, bigCir9.a);

    gl_FragColor = col;

}