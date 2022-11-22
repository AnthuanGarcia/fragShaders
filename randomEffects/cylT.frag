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

#define ORTOGRAPHIC 0
#define RECT_SIZE 2.0

#define DEG2R 0.01745329

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

float sdCylinder( vec3 p, vec3 c )
{
	return length(p.xz-c.xy)-c.z;
}

float opSSub( float d1, float d2, float k ) {

    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);

}

float scene(vec3 p) {

	vec2 mou = 2.0*(u_mouse / u_resolution)-1.0;
	mou.x *= ASPECT;

	vec3 k = p - vec3(mou, 0.6);

	//p.z += 0.25*u_time;
	p.xy *= rot2D(-45.0 * DEG2R * sin(u_time));

	//vec3 c = vec3(1, 0, 0);
	//vec3 q = mod(p + 0.5*c, c) - 0.5*c;

	float cyl = sdCylinder(p, vec3(0.0, 0.5, 0.6));
	//float pla = sdPlane(p, vec3(0, 1, 0), 0.2);
	vec2 dis = 0.2*cos(10.0*p.yx + 3.*u_time) * cos(u_time);

	//k = abs(k);
	//float sph = max(k.x, max(k.y, k.z)) - 0.4;

	float sph = length(k) - 0.6;

	//return max(cyl + dis.x*dis.y, -sph);
	return opSSub(sph, cyl, 0.5);

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

	for (int i = 0; i < MAX_STEPS; i++) {

		if( abs(h) < precis || d >= MAX_DIST )
			break;

        d += h;
		h = scene(ro + d*rd);

	}

	return d;

}

vec3 sun = vec3(0, 200, -100);

vec3 shade(vec3 ro, vec3 pos) {

	vec3 n = getNormal(pos);
	vec3 viewPos = normalize(ro - pos);
	vec3 lightDir = normalize(sun - pos);
	vec3 reflectDir = normalize(reflect(-lightDir, n));

	float spec = pow( max( dot(viewPos, reflectDir), 0.0 ), 64.0);
	float diff = max(dot(n, lightDir), 0.0);
	float front = max(dot(viewPos, n), 0.0);

	float rim = 1.0 - front;

	vec3 diffuse = diff * vec3(1.0, 0.5686, 0.0);

	return vec3(0.5373, 0.0, 0.3412) + diffuse + spec + rim*0.5;

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= ASPECT;

	vec3 col = vec3(0.9961, 0.7412, 0.8235);

#if ORTOGRAPHIC

	vec3 ro = vec3(RECT_SIZE*uv, -1);
	vec3 rd = vec3(0, 0, 1);

#else

	vec3 ro = vec3(0, 0, -1);
	vec3 rd = normalize(vec3(uv, 1.0));

#endif

	float t = march(ro, rd);
	float hit = step(t, MAX_DIST - LIM_VAL);

	col = mix(
		col,
		shade(ro, ro + rd*t), // shade
		hit
	);

	fragColor = vec4(col, 1);

}