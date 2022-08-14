#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ZOOM 5.0
#define ASPECT u_resolution.x / u_resolution.y

#define SQR(p, l) max(p.x, p.y) - l
#define RX ZOOM / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
    uv.x *= ASPECT;
	uv *= ZOOM;

	vec2 uv2 = uv;

	uv2 *= mat2(
        0.707106, 0.707106,
        -0.707106, 0.707106
    );

	vec2 ipos = floor(uv2) + 0.5;
    
    uv2.x += u_time*0.5;
    
    vec2 fpos = fract(uv2) - 0.5;
    
	vec3 col = vec3(1);

    vec2 ot = vec2(0.15, 0);

	float frame = clamp(step(6.0, abs(ipos.x)) + step(2.0, abs(ipos.y)), 0.0, 1.0);
	float frame2 = step(0.0, -abs(ipos.x)) + step(-2.0, -abs(ipos.y));
    
    col = mix(
        col,
        vec3(0),
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

	col = mix(
		col,
		vec3(0),
		plot(abs(fpos.y), 0.03) * frame2
	);

	fragColor = vec4(col, 1);

}