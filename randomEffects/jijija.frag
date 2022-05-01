#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define CIRCLE(r, p) length(p) - abs(r)
#define SQUARE(l, p) max(p.x, p.y) - l

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 col = vec3(1);

    float d = 1.0/sqrt(2.0);
    vec2 r = vec2(cos(u_time), sin(u_time));

    mat2 rot = mat2(
        r[0], -r[1],
        r[1], r[0]
    );

    mat2 rot2 = mat2(
        r[1], -r[0],
        r[0], r[1]
    );

    //uv = fract(uv);

    float circles = 
    plot( abs( CIRCLE(d*0.5, abs(uv)) ) , 0.005 ) + 
    plot( abs( CIRCLE(0.5, abs(uv)) ) , 0.005 ) + 
    plot( abs( CIRCLE(d, abs(uv)) ) , 0.005 ) + 
    plot( abs( CIRCLE(1.0, abs(uv)) ) , 0.005 );
    
    float squares = 
    plot( abs( SQUARE(d*0.5, abs(uv * rot)) ), 0.005 ) +
    plot( abs( SQUARE(0.5, abs(uv * rot2)) ), 0.005 ) +
    plot( abs( SQUARE(d, abs(uv * rot)) ), 0.005 ) + 
    plot( abs( SQUARE(1.0, abs(uv * rot2)) ), 0.005 );

    col = mix(col, vec3(0), circles + squares);

    fragColor = vec4(col, 1);

}