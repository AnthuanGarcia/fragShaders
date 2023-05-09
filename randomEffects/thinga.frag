#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)
#define PI 3.14159265
#define GLOW(r, d, i) pow(r/(d), i)

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float smoothNoise(vec2 st) {

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    fpos = fpos*fpos * (3.0 - 2.0 * fpos);

    float bl = noise(ipos);
    float br = noise(ipos + vec2(1, 0));
    float b  = mix(bl, br, fpos.x);
    
    float tl = noise(ipos + vec2(0, 1));
    float tr = noise(ipos + vec2(1));
    float t  = mix(tl, tr, fpos.x);

    return mix(b, t, fpos.y);

}

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

float g(float x) {
    
    return sqrt(x*x+1.0)*0.8-1.8;

}

float g(float x, float y, float freq) {
    
    x *= freq;
    
    float x1 = abs(mod(x+PI,PI*2.0)-PI);
    float x2 = abs(mod(x   ,PI*2.0)-PI);
    
    float a = 0.18*freq;
    
    x1 /= max( y*a+1.0-a,1.0);
    x2 /= max(-y*a+1.0-a,1.0);
    return (mix(-g(x2)-1.0,g(x1)+1.0,clamp(y*0.5+0.5,0.0,1.0)))/max(freq*0.8,1.0)+max(abs(y)-1.0,0.0)*sign(y);

}

float opSmoothUnion( float d1, float d2, float k ) {

    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
	vec2 mou = u_mouse / u_resolution - 0.5;

	uv.x *= u_resolution.x / u_resolution.y;
	mou.x *= u_resolution.x / u_resolution.y;

	uv *= 5.0;
	mou *= 5.0;

	vec3 col = vec3(0);
	
	vec2 auv = uv * 3.0;
	//auv *= rot2D(u_time*0.025);
	auv = fract(auv) - 0.5;

	//float cosine = g(uv.x + u_time, uv.y, 1.0);
	float square = length(auv) - 0.2;
	float cirlce = (length(uv - mou) - 0.3) - 0.5 * smoothNoise(uv + u_time);

	col = mix(
		col,
		vec3(1),
		/*plot(
			abs( opSmoothUnion(cirlce, square, 0.5) ),
			0.015
		)*/
		GLOW(0.01, abs(opSmoothUnion(cirlce, square, 0.5)), 0.9)
	);

	fragColor = vec4(col, 1);

}