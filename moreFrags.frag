#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 col = vec3(1);

    st.x *= u_resolution.x / u_resolution.y;
    st = st * 10.0 - 5.0;

    //vec2 bl = smoothstep(vec2(0.15), vec2(0.25), st);
    //vec2 tr = smoothstep(vec2(0.15), vec2(0.25), 1.0 - st);

    vec3 d = length( max(abs(st) - 2.5, 0.0) ) * vec3(tan(u_time * 1.5), 0, 0);

    //vec3 mask = smoothstep(0.05, -0.05, abs(a) - width) * vec3(1, 1, 0);

    gl_FragColor = vec4(step(vec3(0.1), d) * step(d, vec3(0.2)), 1.0);

}