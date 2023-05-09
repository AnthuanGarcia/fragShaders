#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define PI 3.14159265

float g(float x) {
    
    return sqrt(x*x+1.0)*0.8-1.8;

}

float g(vec2 p, float freq) {
    
    p.x *= freq;
    
    float x1 = abs(mod(p.x+PI,PI*2.0)-PI);
    float x2 = abs(mod(p.x   ,PI*2.0)-PI);
    
    float a = 0.18*freq;
    
    x1 /= max( p.y*a+1.0-a,1.0);
    x2 /= max(-p.y*a+1.0-a,1.0);
    return (mix(-g(x2)-1.0,g(x1)+1.0,clamp(p.y*0.5+0.5,0.0,1.0)))/max(freq*0.8,1.0)+max(abs(p.y)-1.0,0.0)*sign(p.y);

}

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

float aastep(float value, float threshold) {

    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return 1.0 - smoothstep(threshold-afwidth, threshold+afwidth, value);

}

float opSmoothUnion( float d1, float d2, float k ) {

    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	vec2 mou = 2.0*(u_mouse / u_resolution) - 1.0;

	uv *= 3.0;
	mou *= 3.0;

	vec3 col = vec3(1);

	vec2 fpos = fract(uv);
	float circle = length(uv - mou) - 0.5;

	uv.x -= u_time;
	
	float cosine = g(uv, 1.0);

	col = mix(
		col,
		vec3(0),
		aastep(abs(opSmoothUnion(cosine, circle, 0.75)), 0.015)
	);

	fragColor = vec4(col, 1);

}