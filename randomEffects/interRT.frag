#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

vec3 sunPos = vec3(-100, -200, 100);

vec3 cSph = vec3(0, 0, 0);

mat2 rot2D(float angle) {

	float s = sin(angle);
	float c = cos(angle);

	return mat2(
		c, -s,
		s, c
	);

}

vec3 rotate(vec3 p, vec3 a) {

	p.yz *= rot2D(a.x);
	p.xz *= rot2D(a.y);
	p.xy *= rot2D(a.z);

	return p;

}

float sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{

    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;

    return h < 0.0 ? -1.0 : -b - sqrt( h );

}

vec2 boxIntersect( in vec3 ro, in vec3 rd, vec3 boxSize, out vec3 outNormal ) 
{
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    outNormal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
    return vec2( tN, tF );
}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;

	vec3 col = vec3(0);

	vec3 r  = vec3(0, u_time, 0);
	vec3 ro = vec3(0, 0, -0.5);
	vec3 rd = normalize( vec3(uv, 1.0) );

	ro = rotate(ro, r);
	rd = rotate(rd, r);

	vec3 nb;

	float t = sphIntersect(ro, rd, cSph, 0.235);
	vec2 tc = boxIntersect(ro, rd, vec3(0.15), nb);

	float shape = min(t, tc.y);

	/*vec3 posC = ro + rd*t;
	vec3 posB = ro + rd*tc.y;

	vec3 nc = normalize(cSph - posC);
	vec3 lightDir = normalize(sunPos - posC);

	vec3 lightDirB = normalize(sunPos - posB);

	float diff = max(dot(nc, lightDir), 0.0);
	float diffB = max(dot(nb, lightDirB), 0.0);*/

	col = mix(
		col,
		//vec3(1, 0.45, 0) + diff*0.4,
		vec3(1, 0, 0.5),
		step(0.0, shape)
	);

	fragColor = vec4(col, 1);

}