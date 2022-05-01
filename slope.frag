#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(float st) {

    return smoothstep(0.005, 0.0, abs(st));

}

void main() {

    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    vec2 mou = (u_mouse/u_resolution) * 2.0 - 1.0;

    vec2 axis = uv;

    vec3 col = vec3(0);

    vec2 p2 = mou;

    float m = -p2.y / -p2.x;

    uv.y -= m*uv.x;

    float len = step( abs(uv.x), abs(p2.x) );
    float side = step( 0.0, uv.x*p2.x );

    col += plot(uv.y) * len * side +
         ( plot(axis.y) + plot(axis.x) ) * vec3(0.3);

    gl_FragColor = vec4(col, 1.0);

}