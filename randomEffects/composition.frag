#version 300 es

precision mediump float;
		
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
		
out vec4 fragColor;

#define TWO_PI 6.283185
#define RX 1.0 / min(u_resolution.x, u_resolution.y)

mat2 rot2D(float angle) {

	float c = cos(angle);
	float s = sin(angle);

	return mat2(
		c, -s,
		s, c
	);

}

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

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

float polarFlower(in vec2 uv, float npetals, float t, float a, float o) {

	vec2 pol = vec2(
		length(uv),
		atan(uv.y, uv.x)
	);

	pol.y /= TWO_PI;

	float y = pol.y * npetals;
	float m = min(fract(y), fract(1.0 - y));

	return plot(abs(m * a + o - pol.x), t);

}

float sdVesica(vec2 p, float r, float d)
{
    p = abs(p);
    float b = sqrt(r*r-d*d);
    return ((p.y-b)*d>p.x*b) ? length(p-vec2(0.0,b))
                             : length(p-vec2(-d,0.0))-r;
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

float flower1(in vec2 uv, float sizeStem) {

	vec2 stem = uv * vec2(1, 3);
	float curve = smoothNoise(stem) * 0.05;

	vec2 uv2 = uv * rot2D(radians(25.0));

	vec2 petaluv = (uv2 - vec2(-0.17, 0.1));

	float aCurve = smoothNoise(petaluv * 6.0 ) * 0.05;
	float petal = sdUnevenCapsule(petaluv - aCurve, -0.1, 0.05, 0.25);

	vec2 uv3 = uv*rot2D(radians(-15.0));
	uv3 += vec2(-0.37, 0.045);

	vec2 petaluv2 = (uv3 - vec2(-0.32, 0.19));

	aCurve = smoothNoise(petaluv2 * 6.0) * 0.05;
	float petal2 = sdUnevenCapsule(petaluv2 - aCurve, -0.1, 0.065, 0.25);

	return plot(abs(stem.x + curve), 0.0025) * step(-sizeStem, -abs(stem.y)) + 
	plot(abs(petal), 0.0025) + 
	plot(abs(petal2), 0.0025);

}

void main() {
		
	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
	uv.x *= u_resolution.x / u_resolution.y;

	vec3 col = vec3(1);

	col -= flower1(uv, 1.0);
		
	fragColor = vec4(col, 1);
		
}