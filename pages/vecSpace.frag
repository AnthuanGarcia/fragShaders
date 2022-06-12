#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define range(ii, l, s) for(float i = ii; i < l; i += s)

vec2 parametric(vec2 p) {

    return  vec2(
        2.0*p.x * sin(p.x * p.y),
        -cos(p.x + p.y) - p.x
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(0);

    range(1.0, 2.0, 0.1) {

        uv += 0.2 * parametric(i + uv * sin(0.5*u_time));
        uv -= 1.50 * parametric(i / uv + cos(0.5*u_time));

    }

    col = mix(
        col,
        vec3(0.25),
        uv.x *uv.y
    );
    
    fragColor = vec4(col, 1);

}
