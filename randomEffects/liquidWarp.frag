#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 mou = 2.0*(u_mouse/u_resolution) - 1.0;

    vec3 col;

    for (float i = 1.0; i < 16.0; i++) {

        uv.x += 0.5/i * sin(3.0*i*uv.y + u_time*0.5 + mou.x) + u_time*0.01;
        uv.y += 0.5/i * cos(3.0*i*uv.x + u_time*0.5 + mou.y);

    }

    col.b = cos(uv.x * uv.y)*0.5 + 0.1;
    col.r = sin(uv.x - uv.y)*0.5 + 0.5;
    col.g = (cos(uv.x + uv.y) * sin(uv.x + uv.y))*0.5 + 0.5;

    gl_FragColor = vec4(col, 1.0);

}