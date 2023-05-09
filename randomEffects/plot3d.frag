#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer0;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

#define DEG2R 0.01745329

#define MAX_STEPS 32
#define MIN_DIST  0.0
#define MAX_DIST  16.0
#define LIM_VAL   1E-4

#define ORTOGRAPHIC 0
#define RECT_SIZE 9.0

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

float sdPlane( vec3 p, vec3 n, float h ) {

	return dot(p,n) + h;

}

float cube(vec3 p, float s) {

	p = abs(p);
	return max(p.x, max(p.y, p.z)) - s;

}

float sdBox( vec3 p, vec3 b ) {

	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);

}

float scene(vec3 p) {

	vec2 mou = (2.0*(u_mouse / u_resolution)-1.0) * rot2D(90.0 * DEG2R);
	mou.x *= ASPECT;

	p = rotate(p, vec3(mou * 3.14159265, 0));

	float plane = sdPlane(p, vec3(0, 1, 0), 0.0);
	float cube = sdBox(p, vec3(0.7)) - 0.05;

	vec2 dis = 0.5*cos(5.0*p.zx + u_time) * sin(u_time);

	return max(cube, plane + dis.x*dis.y);

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

float march(vec3 ro, vec3 rd) {

	float precis = 0.001;
    float h = precis*2.0;
	float md = 1.0;
	float d = MIN_DIST;

	float res = -1.0;

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h) < precis || d >= MAX_DIST )
			break;

		h = scene(ro + d*rd);		
        d += h;

	}

	if (d < MAX_DIST) res = d;

	return res;

}

vec3 sun = vec3(100, 100, 100);

vec3 shade(vec3 ro, vec3 pos, vec3 n) {

	//vec3 n = getNormal(pos);
	vec3 viewPos = normalize(ro - pos);
	vec3 lightDir = normalize(sun - pos);
	vec3 reflectDir = normalize(reflect(-lightDir, n));

	float spec = pow( max( dot(viewPos, reflectDir), 0.0 ), 32.0);
	float diff = max(dot(n, lightDir), 0.0);
	float rim  = 1.0 - dot(n, viewPos);

	//spec = smoothstep(0.0, 0.1, spec);
	//rim  = pow(rim, 3.0);

	float kw = (1.0 + dot(n, lightDir)) * 0.5;

	vec3 cw = vec3(0.0, 0.6902, 0.7137);
	vec3 cc = vec3(0.7333, 0.0, 1.0);

	vec3 col = mix(cw, cc, kw);

	vec3 diffuse = vec3(0.25) * diff;
	vec3 specular = vec3(1) * spec;
	vec3 rimLigth = vec3(0.25) * rim;

	return clamp(
		col +
		diffuse + 
		specular +
		rimLigth,
		0.0, 1.0
	);

}

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {

	vec3 rr = vec3(sin(roll), cos(roll), 0.0);
	vec3 ww = normalize(target - origin);
	vec3 uu = normalize(cross(ww, rr));
	vec3 vv = normalize(cross(uu, ww));

  	return mat3(uu, vv, ww);
	
}

vec3 getRay(vec3 origin, vec3 target, vec2 screenPos, float lensLength) {
  mat3 camMat = calcLookAtMatrix(origin, target, 0.0);
  return normalize(camMat * vec3(screenPos, lensLength));
}

vec2 squareFrame(vec2 screenSize, vec2 coord) {
  vec2 position = 2.0 * (coord.xy / screenSize.xy) - 1.0;
  position.x *= screenSize.x / screenSize.y;
  return position;
}

vec2 getDeltas(sampler2D buffer, vec2 uv) {
  vec2 pixel = vec2(1. / u_resolution.xy);
  vec3 pole = vec3(-1, 0, +1);
  float dpos = 0.0;
  float dnor = 0.0;
    
  vec4 s1 = texture(u_buffer0, uv + pixel.xy * pole.yx); // x2, y1
  vec4 s0 = texture(u_buffer0, uv + pixel.xy * pole.xx); // x1, y1
  vec4 s2 = texture(u_buffer0, uv + pixel.xy * pole.zx); // x3, y1
  vec4 s3 = texture(u_buffer0, uv + pixel.xy * pole.xy); // x1, y2
  vec4 s4 = texture(u_buffer0, uv + pixel.xy * pole.yy); // x2, y2
  vec4 s5 = texture(u_buffer0, uv + pixel.xy * pole.zy); // x3, y2
  vec4 s6 = texture(u_buffer0, uv + pixel.xy * pole.xz); // x1, y3
  vec4 s7 = texture(u_buffer0, uv + pixel.xy * pole.yz); // x2, y3
  vec4 s8 = texture(u_buffer0, uv + pixel.xy * pole.zz); // x3, y3

  dpos = (
    abs(s1.a - s7.a) +
    abs(s5.a - s3.a) +
    abs(s0.a - s8.a) +
    abs(s2.a - s6.a)
  ) * 0.5;
  dpos += (
    max(0.0, 1.0 - dot(s1.rgb, s7.rgb)) +
    max(0.0, 1.0 - dot(s5.rgb, s3.rgb)) +
    max(0.0, 1.0 - dot(s0.rgb, s8.rgb)) +
    max(0.0, 1.0 - dot(s2.rgb, s6.rgb))
  );
  
  dpos = pow(max(dpos - 0.5, 0.0), 5.0);
    
  return vec2(dpos, dnor);
}

#if defined(BUFFER_0)

	void main() {

		vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
		uv.x *= ASPECT;

		vec3 col = vec3(1);

	#if ORTOGRAPHIC

		vec3 ro = vec3(RECT_SIZE*uv, -1);
		vec3 rd = vec3(0, 0, 1);

	#else

		vec3 ro = vec3(0, 1, -1.5);
		vec3 rd = normalize(vec3(uv, 1.0));

	#endif

		mat2 r45 = rot2D(45.0 * DEG2R);

		ro -= vec3(0, 1, -1.5);

		ro.yz *= r45;
		rd.yz *= r45;

		ro += vec3(0, 1, -1.5);

		//ro.xz *= r45;
		//rd.xz *= r45;

		float t = march(ro, rd);
		//float hit = step(t, MAX_DIST - LIM_VAL);

		//col = mix(
		//	col,
		//	shade(ro, ro + rd*t), // shade
		//	hit
		//);
		vec3 pos = ro + rd*t;

		//fragColor = vec4(col, 1);
		fragColor = vec4(getNormal(pos), t);

	}

#else

	void main() {
		vec3 ro = vec3(0, 1, -1.5);
		vec3 ta = vec3(0, 0, 0);
		vec3 rd = getRay(ro, ta, squareFrame(u_resolution.xy, gl_FragCoord.xy), 2.0);
		vec2 uv = gl_FragCoord.xy / u_resolution.xy;
			
		vec4 buf = texture(u_buffer0, uv);
		float t = buf.a;
		vec3 nor = buf.rgb;
		vec3 pos = ro + rd * t;
			
		vec3 col = vec3(1);
		vec2 deltas = getDeltas(u_buffer0, uv);

		if (t > -0.5) {
			//col = vec3(1.0);
			//col *= max(0.3, 0.3 + dot(nor, normalize(vec3(0, 1, 0.5))));
			//col *= vec3(1, 0.0, 1);

			col = shade(ro, pos, nor);

		}

		col.r = smoothstep(0.1, 1.0, col.r);
		col.g = smoothstep(0.1, 1.1, col.g);
		col.b = smoothstep(-0.1, 1.0, col.b);

		//col = pow(col, vec3(1.1));
		col -= deltas.x - deltas.y;
		
		fragColor = vec4(col, 1);

	}

#endif