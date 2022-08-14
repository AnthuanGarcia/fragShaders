#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 64
#define MIN_DIST  0.0
#define MAX_DIST  16.0
#define LIM_VAL   1E-4

#define EDGE 0.07
#define SMOOTH 0.025

#define DEG2R 0.01745329

#define ORTOGRAPHIC 0
#define RECT_SIZE 4.0

#define VT vec2(u_time, 0)

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

vec3 rotate(vec3 p, vec3 a) {

	p.yz *= rot2D(a.x);
	p.xz *= rot2D(-a.y);
	p.xy *= rot2D(a.z);

	return p;

}

float sdBox( vec3 p, vec3 b ) {

	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);

}

float sdCappedCylinder( vec3 p, float h, float r ) {

	vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(h,r);
  	return min(max(d.x,d.y),0.0) + length(max(d,0.0));

}

float sdTriIso( in vec2 p, in vec2 q ) {

	p.x = abs(p.x);
    vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
    vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
    float s = -sign( q.y );
    vec2 d = min( vec2( dot(a,a), s*(p.x*q.y-p.y*q.x) ),
                  vec2( dot(b,b), s*(p.y-q.y)  ));
    return -sqrt(d.x)*sign(d.y);
}

float opExtrussion( in vec3 p, in float sdf, in float h ) {

	vec2 w = vec2( sdf, abs(p.z) - h );
  	return min(max(w.x,w.y),0.0) + length(max(w,0.0));

}

float sdfV(vec3 p) {

	vec3 cb = p - vec3(0, 0, 3);
	float b = sdBox(cb, vec3(1, 0.8, 0.25));

	vec3 q = p - vec3(0, -0.5*0.5, 3);
	float tc = opExtrussion(q, sdTriIso(q.xy, vec2(1.25, 3.50)*0.5), 6.0);
	b = max(b, -tc);

	vec3 tcl = vec3(abs(p.x), p.yz) - vec3(2.0*0.5, 3.0*0.5, 3);
	tc = opExtrussion(tcl, sdTriIso(-tcl.xy, vec2(2.40, 7.0)*0.5), 6.0);
	b = max(b, -tc);

	//vec3 tcr = p - vec3(-2, 2, 3);
	//tc = opExtrussion(tcr, sdTriIso(-tcr.xy, vec2(3.0, 7.0)), 6.0);
	//b = max(b, -tc);

	return b;

}

float sdfU(vec3 p, float d) {

	vec3 cc = p - vec3(0, 0, 3);

	//cc = rotate(cc, vec3(0, 0.75*u_time, 0));
	cc.zy *= rot2D(90.0 * DEG2R);

	float u = max(
		sdCappedCylinder(cc, 0.9, d),
		-sdCappedCylinder(cc, 0.5, 1.50)
	);

	vec3 boxCenter = p - vec3(0, 1, 3);

	u = max(
		u,
		-sdBox(boxCenter, vec3(2, 1, 2))
	);

	vec3 cb = p - vec3(0, 0.69, 3);
	
	//cb = rotate(cb, vec3(0, 0.75*u_time, 0));

	float center = max(
		sdBox(cb, vec3(0.9, 0.75, d)),
		-sdBox(cb, vec3(0.5, 1, 2))
	);

	return min(u, center);

}

float eyes(in vec3 p) {

	vec3 o = vec3(3, 0, 0);
	//float a = 9.0;
	//p = -rotate(p, vec4(cos(a * DEG2R), 0, -sin(a * DEG2R), 0));

	return sdfU(vec3(abs(p.x), p.yz) - o, 0.25);

}

float sdfW(in vec3 p) {

	vec3 o = vec3(0.6, 0, 0);

	return sdfV(vec3(abs(p.x), p.yz) - o);

}

float scene(in vec3 p) {

	/*vec3 eye = vec3(1.5, 0, 0);

	float UwU = min(
		sdfU(p+eye, 0.25),
		sdfU(p-eye, 0.25)
	);*/

	p -= vec3(0, 0, 3);
	p = rotate(p, vec3(0, 0.5*u_time, 0));
	p += vec3(0, 0, 3);

	float UwU = min(eyes(p), sdfW(p));

	return UwU;

}

// -- From: https://www.shadertoy.com/view/4s2XRd
vec3 march(vec3 ro, vec3 rd) {

	float precis = 0.001;
    float h = precis*2.0;
	float md = 1.0;
	vec2 d = vec2(MIN_DIST, 10000.0);
	//float t = MIN_DIST;
	bool stp = false;

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h)<precis || d.x>=MAX_DIST ) break;

        d.x += h;

		float dist = scene(ro + d.x*rd);

		if (!stp) {

			md = min(md, dist);

			if (h < EDGE && h < dist && i > 0) {
				stp = true;
				d.y = d.x;
			}

		}

		h = dist;

	}

	return vec3(d, stp ? smoothstep(EDGE-SMOOTH, EDGE+0.01, md) : 1.0);

}

vec3 getNormal(vec3 p, float d) {

	vec2 h = vec2(LIM_VAL, 0)*d;

	return normalize(
		vec3(
			scene(p + h.xyy) - scene(p - h.xyy),
			scene(p + h.yxy) - scene(p - h.yxy),
			scene(p + h.yyx) - scene(p - h.yyx)
		)
	);

}

#define SPECULAR 0.5

vec3 shade(vec3 pos, vec3 ro) {

	vec3 n = getNormal(pos, distance(pos, ro));
	vec3 viewPos = normalize(ro - pos);
	vec3 lightDir = normalize(vec3(2, 2,-5) - pos);
	vec3 reflectDir = normalize(reflect(-lightDir, n));

	//vec3 hv = normalize(lightDir + rd);
	//float spec = dot(n, hv);

	float spec = pow( max( dot(viewPos, reflectDir), 0.0 ), 400.0);
	float diff = dot(n, lightDir);

	//float de = fwidth(diff) * 5.0;
	//float diffSmooth = smoothstep(0.0, 0.3, diff);

	//float a = sqrt( 1.0 - diff*diff );
	//vec3 diffuse = a * vec3(0.3804, 0.0, 0.2431);
	//float de = dot(n, rd);

	float kw = (1.0 + dot(n, lightDir)) * 0.5;

	vec3 cw = vec3(0.4, 0.4, 0.7);
	vec3 cc = vec3(0.8, 0.6, 0.6);

	//vec3 cw = vec3(0.6431, 0.0078, 0.0078);
	//vec3 cc = vec3(0.7373, 0.0196, 0.3804);

	vec3 col = mix(cw, cc, kw);
	//vec3 specular = SPECULAR * spec * vec3(1);
	//vec3 specular = vec3(1.0, 1.0, 1.0) * pow(diff * de + a * sqrt( max(1.0 - de*de, 0.0)), 8.0);
	//float specular = pow(spec, 40.0);
	float specSmooth = smoothstep(0.0, 0.0025, spec);

	/*if(light < 0.2)
		toon = 0.2;
	else if (light < 0.5)
		toon = 0.5;
	else
		toon = 0.9;*/

	float toon = smoothstep(0.0, 0.5, diff + spec);

	return col + specSmooth*vec3(1);

	//return col;

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

	vec3 col = vec3(0.0471, 0.8118, 0.5294);

	/*uv *= mat2(
		0.7071, 0.7071,
		-0.7071, 0.7071
	);

	uv.y += 0.5*u_time*sign(uv.x);

	vec2 fpos = fract(uv) - 0.5;*/

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -1);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -6);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	vec3 t = march(ro, rd);
	float hit = step(t.x, MAX_DIST - LIM_VAL);

	//col += shade(ro + rd*t.x, ro, t.yz);

	col = mix(
		col,
		shade(ro + rd*t.x, ro),
		hit
	);

	col *= mix(t.z, 1.0, smoothstep(30.,40.,t.y));

	fragColor = vec4(col, 1);

}