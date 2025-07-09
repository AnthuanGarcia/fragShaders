#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define MAX_STEPS 40
#define MIN_DIST  0.0
#define MAX_DIST  16.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 01
#define RECT_SIZE 1.0

float sdfTorus(vec3 p, vec2 r) {

	float S = length(p.xy) - r[0];
	return S*S + p.z*p.z - r[1]*r[1];

}

float sdRoundBox( vec3 p, vec3 b, float r ) {

	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;

}

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

vec2 scene(vec3 p) {

	p.yz *= rot2D(u_time);
	p.xz *= rot2D(u_time);
	p.xy *= rot2D(u_time);

	float torus = sdfTorus(
		p - vec3(0, 0.4, 0.), vec2(0.2, 0.075)
	);
	
	float box = sdRoundBox(
		p + vec3(0, 0., 0), vec3(0.2), 0.07
	);

	float id = 1.0;
	float obj = torus;

	if (box < torus) {
		id = 2.0;
		obj = box;
	}

	return vec2(obj, id);

}

vec3 getNormal(vec3 p) {

	const vec2 h = vec2(LIM_VAL, 0);

	return normalize(
		vec3(
			scene(p + h.xyy).x,
			scene(p + h.yxy).x,
			scene(p + h.yyx).x
		) - scene(p).x
	);

}

vec2 march(vec3 ro, vec3 rd) {

	float precis = 0.001;
    float h = precis*2.0;
	vec2 d = vec2(MIN_DIST, 0.0);
	
	vec2 hit;

	for (int i = 0; i < MAX_STEPS; i++) {

		hit = scene(ro + d.x*rd);

		d.y = hit.y;
		h = hit.x;

		d.x += h;

		if( abs(h) < precis || d.x > MAX_DIST )
			break;

	}

	return d;

}

vec3 shade(vec3 pos, vec3 ro, float id) {

	vec3 sun = vec3(
		50.0,
		100.0,
		-50.0
	);

	vec3 n = getNormal(pos);

	vec3 lightDir = normalize(sun - pos);
	vec3 viewDir = normalize(ro - pos);
	vec3 reflLight = reflect(-lightDir, n);

	float diff = max( dot(lightDir, n), 0.0 );
	float spec = pow( max(dot(reflLight, viewDir), 0.0), 64.0 );
	float rim  = 1.0 - max(dot(viewDir, n), 0.0);

		//rim = pow(rim, 2.0);

	float kw = (dot(lightDir, n) + 1.0) * 0.5;

	vec3 cc = vec3(0.8157, 0.0627, 0.5647);
	vec3 cv = vec3(0.0902, 0.4118, 0.6902);

	if (id > 1.0) {
		cc = vec3(0.1608, 0.6078, 0.0);
		cv = vec3(0.8471, 0.8471, 0.0);
	}

	vec3 ambient = mix(cc, cv, kw);

		//vec3 ambient = vec3(0.5569, 0.1255, 0.4118);
	vec3 diffuse = vec3(0.4);
	vec3 rimLight = vec3(0.6)*rim;

	vec3 finalCol = clamp(
		ambient +
		diffuse * diff +
		spec +
		rimLight,
		0.0, 1.0
	);

	return finalCol;

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

	vec3 col = vec3(0.9);

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -1);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -1.0);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	float IOR = 1.4;
	float i = 0.0;

	bool isSecond = false;

	vec2 t;

	for(; i < 10.0; i++) {

		t = march(ro, rd);

		if (t.x < MAX_DIST) {

			//vec3 pos = ro + rd*t.x;
			//col = shade(pos, ro, t.y);

			//if (t.y == 2.0) {

				vec3 p = ro + rd*t.x;
				vec3 n = getNormal(p);

				vec3 rIn = refract(rd, n, 1.0/IOR);

				vec2 hIn = march(p - n*0.003, -rIn);
				vec3 pIn = p + rIn * -hIn.x;
				vec3 nIn = -getNormal(pIn);

				vec3 rOut = vec3(0);
            	float shift = 0.01;

            	rOut = refract(rIn, nIn, IOR);

            	if (dot(rOut, rOut) == 0.0)
                	rOut = reflect(-rIn, nIn);
				
				col *= shade(pIn, ro, t.y);

            	ro = pIn - nIn * 0.03;
            	rd = rOut;

			/*} else if (t.y == 1.0) {

				vec3 pos = ro + rd*t.x;
				vec3 n = getNormal(pos);

				col = shade(pos, ro, t.y);

				break;
				
			}*/

			//vec3 pos = ro + rd*t.x;
			//vec3 n = getNormal(pos);

			//ro = pos + n*0.003;
			//rd = reflect(rd, n);

			//col = shade(pos, ro, t.y);

		}

	}

	fragColor = vec4(col, 1);

}