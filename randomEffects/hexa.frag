#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 64
//#define MAX_STEPS 128
#define MIN_DIST  0.0
#define MAX_DIST  16.0
//#define MAX_DIST  64.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 01
#define RECT_SIZE 1.0

#define D2R 0.0174532925

mat2 rot2D(float a) {
	float s = sin(a), c = cos(a);
	return mat2(c, s, -s, c);
}

float noise(vec2 p) {
    return fract(sin(p.x * 10.0 + p.y * 1234.5) * 5647.0);
}

float sdHexagon( in vec2 p, in float r )
{
    const vec3 k = vec3(-0.866025404,0.5,0.577350269);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p)*sign(p.y);
}

float opExtrusion( in vec3 p, float d, in float h )
{
    vec2 w = vec2( d, abs(p.z) - h );
    return min(max(w.x,w.y),0.0) + length(max(w,0.0));
}

float scene(vec3 p) {

	vec3 q = p;
	q.yz *= rot2D(90.0*D2R+ u_time);
	q.xz *= rot2D(45.0*D2R);

	float hex = opExtrusion(q, sdHexagon(q.xy, 0.3), 0.4); 

	return hex;
}

float march(vec3 ro, vec3 rd) {

	float precis = 0.001;
    float h = precis*2.0;
	float md = 1.0;
	float d = MIN_DIST;

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h) < precis || d >= MAX_DIST )
			break;

        d += h;
		h = scene(ro + d*rd);

	}

	return d;

}

vec3 getNormal(vec3 p) {

	const float h = LIM_VAL;
	const vec2 k = vec2(1,-1);

    return normalize(
		k.xyy*scene( p + k.xyy*h ) + 
    	k.yyx*scene( p + k.yyx*h ) + 
        k.yxy*scene( p + k.yxy*h ) + 
        k.xxx*scene( p + k.xxx*h )
	);

}

vec3 shade(vec3 pos) {
	vec3 sun = vec3(cos(u_time)*100.0, 150, sin(u_time)*100.0);
	vec3 lightDir = normalize(sun - pos);
	vec3 n = getNormal(pos);
	
	float diffuse = max(dot(lightDir, n), 0.0);
	float noi = noise(pos.xy);

	return vec3(0.3804, 0.3373, 0.5333) + vec3(0.8824, 0.6941, 0.0196)*diffuse;
}

void main() {

    vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
    vec3 col = vec3(1);

	uv.x *= ASPECT;

#if ORTOGRAPHIC
	vec3 ro = vec3(uv, -1);
	vec3 rd = vec3(0, 0, 1);
#else
	vec3 ro = vec3(0, 0, -1);
	vec3 rd = normalize(vec3(uv, 1));
#endif
	float t = march(ro, rd);

	if (t < MAX_DIST) {
		vec3 p = ro + rd*t;
		col = shade(p);
	}

    fragColor = vec4(col, 1);

}
