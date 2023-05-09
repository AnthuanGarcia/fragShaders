#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define EPS 1E-4

#define GLOW(r, d, i) pow(r/(d), i)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

mat2 rot2D(float angle) {

	float c = cos(angle), s = sin(angle);
	return mat2(c, -s, s, c);

}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898,12.1414))) * 83758.5453);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fire(vec2 n) {
    return noise(n) + noise(n * 2.1) * .6 + noise(n * 5.4) * .42;
}

float opSmoothUnion( float d1, float d2, float k ) {

    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);

}

float sdUnevenCapsule( vec2 p, float r1, float r2, float h )
{
    p.x = abs(p.x);
    float b = (r1-r2)/h;
    float a = sqrt(1.0-b*b);
    float k = dot(p,vec2(-b,a));
    if( k < 0.0 ) return length(p) - r1;
    if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
    return dot(p, vec2(a,b) ) - r1;
}

float sdRoundedX( in vec2 p, in float w, in float r )
{
    //p = abs(p);
    return length(abs(p)-min(p.x+p.y,w)*0.5) - r;
}

void main() {

	vec2 uv = (2.0*gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
	vec2 mou = (2.0*u_mouse - u_resolution.xy)/u_resolution.y;

	//vec3 col = mix(
	//	vec3(0),
	//	vec3(0, 0, 0.35),
	//	-uv.y
	//);

	vec4 col = vec4(0.0, 0.0, 0.0, 1.0);
	//float curve = noise(uv + u_time)*0.025;

	float c = length(uv) - 0.15;
	//float s = plot(abs(c), 0.001);
	//s += exp(-20.0 * abs(c - EPS));

	//vec2 m = vec2(cos(u_time) / sqrt(5.0), sin(u_time)) * 0.25;
	//m *= rot2D(-radians(45.0));

	//float circlePointer = length(uv - m) - 0.05;
	//float sPointer = plot(abs(circlePointer), 0.001);
	//sPointer += exp(-20.0 * abs(circlePointer - EPS));
	
	col = mix(
		col,
		vec4(1, 1, 2, 1.0),
		//exp(-50.0 * abs(opSmoothUnion(c, circlePointer, 0.25) - EPS))
		//GLOW(0.0035, abs(c), 1.1) +
		GLOW(0.004, abs(sdUnevenCapsule(uv + vec2(0.3, 0.05), 0.04, 0.001, 0.07)), 1.1) +
		GLOW(0.004, abs(sdUnevenCapsule(uv + vec2(0, 0.40), 0.45, 0.45, 0.80)), 1.1)
	);

	fragColor = col;

}