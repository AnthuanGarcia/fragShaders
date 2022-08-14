#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define T 0.1*u_time

#define ZOOM 5.0
#define ASPECT u_resolution.x / u_resolution.y

#define SQR(p, l) max(p.x, p.y) - l
#define RX ZOOM / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void main() {

	vec2 uv = gl_FragCoord.xy/u_resolution.xy - 0.5;
    uv.x *= ASPECT;
    
    vec2 uv2 = uv;
    
    uv2 *= mat2(
        0.707106,  0.707106,
        -0.707106, 0.707106
    );
    
    vec2 ipos = floor(uv2 * ZOOM) + 0.5;
    
    uv2.x -= T;
    
    vec2 fpos = fract(uv2 * ZOOM) - 0.5;
    
    uv *= mat2(
        cos(T), -sin(T),
        sin(T), cos(T)
    );
    
    for (float i = 1.0; i <= 8.0; i += 1.0) {
        
        uv.x += 0.5/i * cos( 3.0 * uv.y * i + u_time );
        uv.y += 0.3/i * sin( 5.0 * uv.x * i + u_time );
    
    }

    vec3 col = vec3(
        
        sin(uv.x + uv.y) * 0.5,
        cos(uv.x - uv.y) * 0.5,
        (sin(uv.x * uv.y) + cos(uv.x * uv.y)) * 0.6 + 0.15
        
    );
    
    vec2 ot = vec2(0.15, 0);
    
    float frame = step(6.0, abs(ipos.x)) + step(2.0, abs(ipos.y));
    
    col = mix(
        col,
        vec3(1),
        //vec3(1),
        max(
        plot(
            abs( SQR(abs(fpos), 0.3) ),
            0.03
        ),
        max(
        plot(
            abs( SQR(abs(fpos + ot), 0.3) ),
            0.03
        ),
        max(
        plot(
            abs( SQR(abs(fpos - ot), 0.3) ),
            0.03
        ),
        max(
        plot(
            abs( SQR(abs(fpos + ot.yx), 0.3) ),
            0.03
        ),
        plot(
            abs( SQR(abs(fpos - ot.yx), 0.3) ),
            0.03
        ))))) * frame
    );

    fragColor = vec4(col,1.0);

}