#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 fill = uv;

    vec3 col = vec3(0.10);
    vec3 fillCol;

    vec2 sincost = vec2(0.075*sin(0.15*u_time)+0.075, 0.075*cos(0.15*u_time)+0.075);
    
    for (float i = 1.0; i < 8.0; i++) {

        fill.x += 0.5/i * sin(3.0*i*fill.y + u_time*0.5) + sincost.y;
        fill.y += 0.5/i * cos(3.0*i*fill.x + u_time*0.5) + sincost.x;

    }

    float uvDot = dot(uv, uv);

    float circle  = step(-0.15, -uvDot);
    float circle2 = step(0.035, uvDot);

    float circleinv  = step(0.15, uvDot);
    float circle2inv = step(-0.035, -uvDot);

    uv.y -= 0.25*uv.x;

    fillCol = mix(vec3(0.0588, 0.8392, 0.9098), vec3(0.8627, 0.6314, 0.4863), fill.x);
    fillCol = mix(fillCol, vec3(0.17), fill.y );

    col += (smoothstep(0.15, 0.0, uv.y) *
           (circleinv + circle2inv)) * vec3(0.8) + 
           fillCol*circle*circle2;


    gl_FragColor = vec4(col, 1);

}