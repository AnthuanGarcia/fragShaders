#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define DEG2R 0.01745329

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

}

vec2 boxIntersection( in vec3 ro, in vec3 rd, vec3 boxSize, out vec3 outNormal ) {
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    outNormal = (tN>0.0) ? step(vec3(tN),t1) : // ro ouside the box
                           step(t2,vec3(tF));  // ro inside the box
    outNormal *= -sign(rd);
    return vec2( tN, tF );
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

vec2 sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0); // no intersection
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}

vec3 shade(vec3 ro, vec3 rd, vec3 n, float d) {

	vec3 sun = vec3(-50.0, 200, -50.0);
	vec3 pos = ro + rd*d;

	vec3 lightDir = normalize(sun - pos);
	vec3 viewDir = normalize(ro - pos);
	vec3 reflLight = reflect(-lightDir, n);

	float amb = 0.5 + 0.5*dot(n,vec3(0.0,1.0,0.0));
	float diff = max( dot(lightDir, n), 0.0 );
	float spec = pow( max(dot(reflLight, viewDir), 0.0), 64.0 );
	float rim  = 1.0 - dot(viewDir, n);

	rim = pow(rim, 1.5);

	vec3 ambient = vec3(0.1255, 0.7412, 0.0941);
	vec3 rimLight = vec3(1)*rim;

	vec3 finalCol = clamp(
		ambient  +
		vec3(0.7412, 0.6196, 0.0118) * diff +
		spec +
		rimLight,
		0.0, 1.0
	);

	return finalCol;

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution;
	//uv.x -= 1.0;
	uv.x *= u_resolution.x / u_resolution.y;

	vec2 mou = u_mouse / u_resolution;
	mou.x *= u_resolution.x / u_resolution.y;

	vec3 col = mix(
		vec3(0.9294, 0.9843, 0.7765),
		vec3(0.8784, 0.9765, 0.7686),
		uv.y * 0.5 + 0.5
	);

	uv.x += u_time * 0.05;

	vec2 fpos = fract(uv) - 0.5;

	//fpos.y += 0.15 * step(mod(floor(uv.y), 2.0), 1.0);

	vec3 ro = vec3(fpos, -2.0);
	vec3 rd = vec3(0, 0, 1);

	float r = 0.15 + 0.1*smoothNoise(uv + vec2(u_time));

	vec2 sph = sphIntersect(ro, rd, vec3(0.0), r);

	if (sph.x > 0.0) {

		vec3 n = normalize(ro + rd * sph.x);
		col = shade(ro, rd, n, sph.x);

	}

	fragColor = vec4(col * sqrt(col), 1);

}