#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define ZOOM vec2(5.50)

const float com = 1.0/(ZOOM.x+ZOOM.y);

float plot(float st, float thickness) {

    return smoothstep(thickness, 0.0, abs(st));

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= ZOOM;
    uv.x *= u_resolution.x / u_resolution.y;

    float xp = length( vec2(uv.x, 2.5) );
    float yp = length( vec2(uv.y, 1.5) );

    vec2 hypCar = vec2(uv.x / xp, uv.y / yp);

    /*mat2 trans = mat2(
        uv.x, 1./( length(uv) - 0.5 ),
        1./( length(uv) - 1.75), uv.y
    );

    mat2 trans2 = mat2(
        uv.x, hypCar.y,
        hypCar.x, uv.y
    );*/

    mat2 trans = mat2(
        1./( length(uv) - 0.5 ), 1./( length(uv) - 1.75),
        uv
    );
    mat2 trans2 = mat2(hypCar, uv);

    uv *= trans*trans2;
    uv.y -= 1./tan(uv.x + u_time*3.50);

    vec3 col = vec3(1);

    col -= plot(uv.y, 0.45);

    gl_FragColor = vec4(col, 1.0);

}