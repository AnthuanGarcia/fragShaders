#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265

#define ZOOM vec2(8.0, 5.0)

#define GRAY vec3(0.74, 0.76, 0.82)
#define WHITE vec3(1)
#define BLACK vec3(0)
#define GRAY_2 vec3(0.48)

float random(vec2 st) {
    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );
}

vec2 rotate(vec2 uv, float angle) {

    uv -= 0.5;

    vec2 c = vec2(cos(angle), sin(angle));

    uv = mat2(
        c[0], c[1],
        -c[1], c[0]
    ) * uv;

    uv += 0.5;

    return uv;

}

vec2 rotateTiles(vec2 uv) {

    float idx;

    idx += floor(mod(uv.x, 2.0)) + 1.0;
    idx += floor(mod(uv.y, 2.0))*2.0;

    uv = fract(uv);

    float noi = random(uv);

    if (idx == 1.0) {

        uv = rotate(uv, -PI*0.5*noi);

    } else if (idx == 2.0) {

        uv = rotate(uv, 19.0*PI*0.008333*noi);

    } else if (idx == 3.0) {

        uv = rotate(uv, PI*0.5*noi);

    } else if (idx == 4.0) {

        uv = rotate(uv, PI*0.3333*noi);

    }

    return uv;

}

vec3 color(vec2 uv) {

    float idx, aux;

    idx += floor(mod(uv.y, 4.0));
    aux += idx + floor(mod(uv.x, 4.0));

    vec3 col;
    
    if (idx == 1.0) {

        col = GRAY_2;

    } else if (idx == 2.0) {

        col = BLACK;

    } else if (idx == 3.0) {

        col = GRAY;

    }

    return aux == 4.0 ? col : WHITE;

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;
    uv *= ZOOM;

    vec2 tiles = uv;
    uv = rotateTiles(uv);
    uv = rotate(uv, -PI*u_time*0.25);

    vec3 col = vec3(1);
    col += color(tiles) - step(uv.x, uv.y);

    gl_FragColor = vec4(col, 1.0);

}