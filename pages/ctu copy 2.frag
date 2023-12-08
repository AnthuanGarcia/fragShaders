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

vec2 cylIntersect( in vec3 ro, in vec3 rd, in vec3 cb, in vec3 ca, float cr ) {

    vec3  oc = ro - cb;
    float card = dot(ca,rd);
    float caoc = dot(ca,oc);
    float a = 1.0 - card*card;
    float b = dot( oc, rd) - caoc*card;
    float c = dot( oc, oc) - caoc*caoc - cr*cr;
    float h = b*b - a*c;
    if( h<0.0 ) return vec2(-1.0); //no intersection
    h = sqrt(h);

    return vec2(-b-h,-b+h)/a;

}

vec3 shade(vec3 ro, vec3 rd, vec3 n, float d) {

	vec3 sun = vec3(0.0, 100.0, 0.0);
	vec3 pos = ro + rd*d;

	vec3 lightDir = normalize(sun - pos);
	vec3 viewDir = normalize(ro - pos);
	vec3 reflLight = reflect(-lightDir, n);

	float N = dot(lightDir, n);
	float diff = max( N, 0.0 );
	float spec = pow( max(dot(reflLight, viewDir), 0.0), 128.0 );
	float rim  = 1.0 - dot(viewDir, n);

	float diffInv = max( dot(-lightDir, n) ,0.0);
	//rim = pow(rim, 1.0);

	//vec3 ambient = vec3(0.702, 0.4667, 0.0902);
	vec3 ambient = mix(
		vec3(0.9843, 0.4, 0.0118),
		vec3(0.5843, 0.5569, 0.0039),
		N * 0.5 + 0.5
	);

	rim *= diffInv;

	vec3 rimLight = vec3(0.6196, 0.4863, 0.0)*rim;

	vec3 finalCol = clamp(
		ambient +
		vec3(0.6627, 0.4118, 0.2353) * diff +
		spec +
		rimLight ,
		0.0, 1.0
	);

	return finalCol;

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
	//uv.x -= 1.0;
	uv.x *= u_resolution.x / u_resolution.y;

	vec3 col = vec3(0.9569, 0.7961, 0.4784);

	uv.y += 0.1;

	vec3 ro = vec3(0, 0, -3);
	vec3 rd = normalize(vec3(uv, 1.0));

	float noi = smoothNoise(uv*6.0 + 0.35*u_time);
	float r = 0.25 + 1.5*noi;

	vec2 cyl = cylIntersect(ro, rd, vec3(0), vec3(1, 0, 0), r);

	if (cyl.x > 0.0) {

		//vec3 posC = ro + rd*cyl.x;
		//vec3 posS = ro + rd*sph.x;

		vec3 pos = ro + rd*cyl.x;

		vec3 n = normalize(vec3(0, pos.yz));

		//vec3 n = min(nC, -nS);
		col = shade(ro, rd, n, cyl.x);
		//col = vec3(1, 0, 0);

	}


	fragColor = vec4(col * sqrt(col), 1);

}