#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define AA 1
#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 64
#define MIN_DIST  0.0
#define MAX_DIST  16.0
#define LIM_VAL   1E-4

#define EDGE 0.05
#define SMOOTH 0.025

#define DEG2R 0.01745329

#define ORTOGRAPHIC 01
#define RECT_SIZE 9.0

#define ONLY_UwU 01
#define OTHER_COLS 0

#define PAL25 vec3(1.158, 0.200, 0.758), vec3(0.138, 0.538, 0.233), vec3(1.135, -0.392, 0.898), vec3(2.188, 2.333, 3.195)
#define PAL22 vec3(0.960, 0.890, -1.102), vec3(0.140, 0.186, 0.150), vec3(0.588, 0.861, 3.138), vec3(5.163, 1.553, 3.277)
#define PAL9 vec3(0.376, 0.777, 0.959), vec3(0.501, 0.477, 0.745), vec3(0.228, 0.161, 0.014), vec3(3.083, 1.247, 0.834)

float idFace = 0.0;

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

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

float sdSphere( vec3 p, float r ) {

	return length(p) - r;

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

float opOnion( in float sdf, in float thickness ) {

    return abs(sdf)-thickness;

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

float sdfD(vec3 p) {

	p -= vec3(2.3, 0, 0);
	vec3 sp = p - vec3(1.8, 0, 3);
	vec3 cp = p - vec3(-0.50, 0, 3);

	cp.zy *= rot2D(90.0 * DEG2R);

	float D = max(
		sdBox(sp, vec3(2.5, 4.25, 0.25)),
		opOnion(sdCappedCylinder(cp, 2.5, 1.0), 0.25)
	);

	vec3 b = p - vec3(-0.45, 0, 3);

	D = min(
		D,
		sdBox(b, vec3(0.25, 2.50, 0.25))
	);

	return D;

}

float colon(in vec3 p) {

	vec3 d = vec3(p.x, abs(p.y), p.z) - vec3(0, 1.8, 3);
	d.zy *= rot2D(90.0 * DEG2R);

	return sdCappedCylinder(d, 0.35, 0.25);

}

float mouth1(in vec3 p) {

	vec3 q = p - vec3(0, 0, 3);
	vec3 u = p - vec3(-3, 0, 3);
	
	//u.xy *= rot2D(90.0 * DEG2R);

	float m = max(
		sdBox(q, vec3(6.0, 3.0, 0.25)),
		-sdSphere(u, 5.0)
	);

	u.x -= 0.45;

	m = max(
		m,
		sdSphere(u, 5.0)
	);

	return m;
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
	p = rotate(p, vec3(0, 0.7*u_time, 0));
	p += vec3(0, 0, 3);

	p -= vec3(0, 0, 3);
	p = rotate(p, vec3(0, 45.0*DEG2R*sign(idFace - 0.5), 0));
	p += vec3(0, 0, 3);

#if ONLY_UwU

	return min(eyes(p), sdfW(p));

#else

	float face;

	if (idFace < 0.6) {

		face = min(eyes(p), sdfW(p)); // UwU

	} else if (idFace < 0.7) {

		p += vec3(0.5, 0, 0);
		face = min(colon(p), mouth1(p)); // :)

	} else {
		p += vec3(2, -0.5, 0);
		face = min(colon(p - vec3(0.5, 0, 0)), sdfD(p)); // :D
	}

	return face;

#endif

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

vec3 getNormal(vec3 p) {

	vec2 h = vec2(LIM_VAL, 0);

	return normalize(
		vec3(
			scene(p + h.xyy) - scene(p - h.xyy),
			scene(p + h.yxy) - scene(p - h.yxy),
			scene(p + h.yyx) - scene(p - h.yyx)
		)
	);

}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b*cos( 6.283185*(c*t + d) );
}

#define SPECULAR 0.5

vec3 shade(vec3 pos, vec3 ro, int mat) {

	vec3 n = getNormal(pos);
	vec3 viewPos = normalize(ro - pos);
	vec3 lightDir = normalize(vec3(2, 1,-5) - pos);
	vec3 reflectDir = normalize(reflect(-lightDir, n));

	//vec3 hv = normalize(lightDir + rd);
	//float spec = dot(n, hv);

	float spec = pow( max( dot(viewPos, reflectDir), 0.0 ), 512.0);
	float diff = dot(n, lightDir);

	//float de = fwidth(diff) * 5.0;
	//float diffSmooth = smoothstep(0.0, 0.3, diff);

	//float dl = dot(n, lightDir);
	//float de = dot(n, viewPos);
	//float specA = pow( dl*de + sqrt(1.0 - dl*dl)*sqrt(1.0 - de*de), 4096.0 );
	vec3 col;

#if OTHER_COLS

	if (mat == 0) {
		col = palette(pos.z, PAL25);
	} else if (mat == 1) {
		col = vec3(0);
	} else {
		col = palette(pos.z, PAL9);
	}

#else

	float kw = (1.0 + dot(n, lightDir)) * 0.5;

	vec3 cw, cc;

	if (mat == 0) {
		cw = vec3(0.97, 0.01, 0.78);
		cc = vec3(0.9333, 1.0, 0.0);
	} else if (mat == 1){
		cw = vec3(1.0, 0.0, 0.6);
		cc = vec3(0.9, 0.7, 0.7);
	} else {
		cw = vec3(0.2);
		cc = vec3(0.1);
	}

	col = mix(cw, cc, kw);

#endif



	//vec3 cw = vec3(0.6431, 0.0078, 0.0078);
	//vec3 cc = vec3(0.7373, 0.0196, 0.3804);

	//vec3 specular = SPECULAR * spec * vec3(1);
	//vec3 specular = vec3(1.0, 1.0, 1.0) * pow(diff * de + a * sqrt( max(1.0 - de*de, 0.0)), 8.0);
	//float specular = pow(spec, 40.0);
	float specSmooth = smoothstep(0.0, 0.0025, spec);
	//float specSmooth = smoothstep(0.0, 0.0025, specA);

	//float toon = smoothstep(0.0, 0.5, diff + spec);

	//col = floor(0.5 + (1000.0 * col)) / 1000.0;

	return clamp(col + specSmooth*vec3(1), 0.0, 1.0);

	//return col;

}

void main() {

#if OTHER_COLS
	vec3 col = vec3(1);
#else
	vec3 col = vec3(0.4902, 0.6824, 0.9294);
#endif

	vec3 tot = vec3(0);

#if AA > 1
	for( int m=0; m<AA; m++ )
    for( int n=0; n<AA; n++ )
    {

    vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
    vec2 uv = (2.0*(gl_FragCoord.xy+o)-u_resolution.xy)/u_resolution.y;

#else
	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;
#endif

	uv *= 1.5;
	uv *= rot2D(-45.0 * DEG2R);

	vec2 backf = fract((uv+0.25*u_time)*5.0)-0.5;
	float thick = 0.01;

	float sgn = sign(mod(floor(uv.x), 2.0) - 0.5);
	uv.y += 0.5*u_time*sgn;

	vec2 fpos = fract(uv) - 0.5;
	vec2 ipos = floor(uv);

#if ONLY_UwU
	idFace = mod(ipos.y, 2.0);
#else
	idFace = noise(ipos);
#endif

	int idMat = int(ceil(mod(ipos.y, 3.0)));

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*fpos, -6);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -6);
	vec3 rd = normalize(vec3(fpos, 1.0));

#endif

	//ro -= vec3(0, 0, 3);
	//ro = rotate(ro, vec3(0, 0.5*u_time, 0));
	//ro += vec3(0, 0, 3);

	//rd = rotate(rd, vec3(0, 0.5*u_time, 0));

	vec3 t = march(ro, rd);
	float hit = step(t.x, MAX_DIST - LIM_VAL);

	//col += shade(ro + rd*t.x, ro, t.yz);

	col = mix(
		col,
		shade(ro + rd*t.x, ro, idMat),
		hit
	);

	col *= mix(t.z, 1.0, smoothstep(20.,30.,t.y));

	tot += col;

#if AA > 1
	}

	tot /= float(AA*AA);
#endif	

	fragColor = vec4(tot, 1);

}
