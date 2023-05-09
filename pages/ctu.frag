#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define DEG2R 0.01745329
#define _H 0.5

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

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;
	uv.x *= u_resolution.x / u_resolution.y;

	vec2 mou = 2.0*(u_mouse / u_resolution) - 1.0;
	mou.x *= u_resolution.x / u_resolution.y;

	vec3 col = mix(
		vec3(0.9373, 0.7765, 0.9843),
		vec3(0.9765, 0.7686, 0.8784),
		uv.y * 0.5 + 0.5
	);

	uv *=  3.0;
	mou *= 3.0;

	vec2 fuv = fract(uv) - 0.5;
	vec2 iuv = floor(uv) - 0.5;
	vec2 imo = floor(mou) - 0.5;

	vec3 ro = vec3(0, 0, -1.5);
	vec3 rd = normalize(vec3(fuv, 1.0));

	if (iuv == imo) {

		ro = rotate(ro, vec3(sin(3.0*u_time)));
		rd = rotate(rd, vec3(sin(3.0*u_time)));

	}

	float r = 0.2 + 0.1*smoothNoise(uv*4.0 + vec2(u_time));

	vec3 n;
	vec2 box = boxIntersection(ro, rd, vec3(0.25), n);

	if (box.x > 0.0) {

		vec3 sun = vec3(50.0, 100, -50.0);
		vec3 pos = ro + rd*box.x;

		vec3 lightDir = normalize(sun - pos);

		float diff = max( dot(lightDir, n), 0.0 );

			//rim = pow(rim, 1.5);

		vec3 col1 = vec3(0.0, 0.0, 0.0),
		col2 = vec3(0.9529, 0.7412, 0.3216),
		col3 = vec3(0.9608, 0.5059, 0.8549);

		float dir = (1.0 + diff) * 0.5;

        vec3 colBase = mix(
            mix(col1, col2, dir/_H),
            mix(col2, col3, (dir - _H)/(1.0 - _H)),
            step(_H, dir)
        );

		vec3 finalCol = clamp(
			colBase,
			0.0, 1.0
		);

		col = finalCol;

	}

	fragColor = vec4(col * sqrt(col), 1);

}