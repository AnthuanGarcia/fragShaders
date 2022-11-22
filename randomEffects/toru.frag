#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define D2R 0.0174532925

#define MAX_STEPS 128
#define MIN_DIST  0.0
#define MAX_DIST  32.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 0
#define RECT_SIZE 1.0

mat2 rot2D(float angle) {

	float c = cos(angle), s = sin(angle);
	return mat2(c, -s, s, c);

}

float sdfTorus(vec3 p, vec2 r) {

	float S = length(p.xy) - r.x;
	return S*S + p.z*p.z - r.y*r.y;

}

float scene(vec3 p) {

	//p.xz *= rot2D(90.0 * D2R);

	p.yz *= rot2D(u_time);
	p.xz *= rot2D(-u_time);
	//p.xy *= rot2D(-u_time);

	return sdfTorus(p, vec2(0.3, 0.125));
	//return sdfTorus(p * cos(p + u_time), vec2(0.25, 0.1));
}

vec3 getNormal(vec3 p) {

	vec2 h = vec2(LIM_VAL, 0);

	//return normalize(
	//	vec3(
	//		scene(p + h.xyy) - scene(p - h.xyy),
	//		scene(p + h.yxy) - scene(p - h.yxy),
	//		scene(p + h.yyx) - scene(p - h.yyx)
	//	)
	//);

	return normalize(
		vec3(
			scene(p + h.xyy) - scene(p),
			scene(p + h.yxy) - scene(p),
			scene(p + h.yyx) - scene(p)
		) //* 1E4
	);

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

vec3 sun = vec3(100, -200.0, -50.0);
vec3 sun2 = vec3( -100.0, -200, -50.0);

vec3 shade(vec3 ro, vec3 pos) {

	vec3 n = getNormal(pos);
	vec3 viewPos  = normalize(ro - pos);
	vec3 lightDir = normalize(sun - pos);
	vec3 refLight = normalize( reflect(-lightDir, n) );
		
	//vec3 refErr = normalize( reflect(-lightDir, viewPos) );

	vec3 dircol1 = normalize(sun2 - pos);

	float N1 = dot(n, dircol1);

	float N    = dot(n, lightDir);
	float diff = max( N, 0.0 );
	float spec = pow( max(dot(refLight, viewPos), 0.0) , 64.0);
	//float spec = pow( max(dot(refErr, n), 0.0) , 64.0);
	float rim  = 1.0 - max(dot(viewPos, n), 0.0);

	vec3 col1 = vec3(0.0, 0.5098, 0.3882);
	vec3 col2 = vec3(0.6157, 0.0157, 0.5255);
	vec3 col3 = vec3(0.0, 0.0706, 0.4588);

	vec3 dircol = mix(col1, col2, N);
	dircol = mix(dircol, col3, N1);
	
	//rim = pow(rim, 2.0);
	rim *= 1.0 - diff;

	//vec3 ambient = vec3(0.502, 0.0, 0.4353);
	//vec3 diffuse = vec3(1.0, 0.0, 0.6157) * diff;
	vec3 ambient = dircol;
	vec3 diffuse = vec3(0.5) * diff;
	vec3 specular = vec3(1) * spec;
	vec3 rimLight = vec3(0.75) * rim;

	return clamp(
		ambient + diffuse + specular + rimLight,
		0.0,
		1.0
	);

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

	vec3 col = mix(
		vec3(0.6196, 0.9059, 1.0),
		vec3(0.9922, 0.5176, 0.8588),
		-uv.y * 0.5 + 0.5
	);

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -0.5);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -1);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	//ro -= vec3(0, 1, -1);
	
	//ro.yz *= rot2D(60.0 * D2R);
	//rd.yz *= rot2D(60.0 * D2R);

	//ro += vec3(0, 1, -1);

	float t = march(ro, rd);
	float hit = step(t, MAX_DIST - LIM_VAL);

	col = mix(
		col,
		shade(ro, ro + rd*t),
		//getNormal(ro + rd*t),
		hit
	);

	fragColor = vec4(col, 1);

}