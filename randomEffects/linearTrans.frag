#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float plot(float st, float thickness) {

    return smoothstep(thickness, 0.0, abs(st));

}

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

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution * 2.0 - 1.0;
    uv *= 0.75;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1.0, 0.0, 0.5);

    mat2 trans = mat2(
        sin(u_time),  random(uv + u_time),
        random(uv + u_time + 1.0), cos(u_time)
    );

    uv *= trans*trans;
    uv /= length(uv) - random(uv+u_time);

    uv.y -= 1.0/cos(0.25*uv.x + u_time);
    uv.y += sin(0.75*u_time);

    col += plot(uv.y, 3.15 ) * vec3(1, 1, 0);

    gl_FragColor = vec4(col, 1.0);

}