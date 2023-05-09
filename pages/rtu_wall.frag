#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define DEG2R 0.01745329
#define BATTERY (0.5*sin(u_time*0.5)+0.5)

mat2 rot2D(float angle) {

    float c = cos(angle);
    float s = sin(angle);

    return mat2(
        c, -s,
        s, c
    );

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
		vec3(0.8431, 0.9216, 1.0),
		vec3(0.95),
		BATTERY
	);

	uv *= 2.0;
	uv *= rot2D(-25.0 * DEG2R);
	uv.y -= 0.2*u_time;

	vec2 fuv = fract(uv - mou) - 0.5;

	vec3 ro = vec3(0, 0, -1.5);
	vec3 rd = normalize(vec3(fuv, 1.0));

	float r = 0.25 + 0.45*smoothNoise(uv*4.0 + u_time);

	vec2 sph = sphIntersect(ro, rd, vec3(0), r);

	if (sph.x > 0.0) {

		vec3 sun = vec3(
			50.0,
			100.0,
			-50.0
		);

		vec3 pos = ro + rd*sph.x;

		vec3 n = normalize(pos);

		vec3 lightDir = normalize(sun - pos);
		vec3 viewDir = normalize(ro - pos);
		vec3 reflLight = reflect(-lightDir, n);

		float diff = max( dot(lightDir, n), 0.0 );
		float spec = pow( max(dot(reflLight, viewDir), 0.0), 64.0 );
		float rim  = 1.0 - dot(viewDir, n);

		//rim = pow(rim, 2.0);

		float kw = (dot(lightDir, n) + 1.0) * 0.5;

		vec3 cc = mix(
			vec3(0.8157, 0.0627, 0.5647),
			vec3(0.6039, 0.6039, 0.6039),
			BATTERY
		);

		vec3 cv = mix(
			vec3(0.0902, 0.4118, 0.6902),
			vec3(0.1529, 0.1529, 0.1529),
			BATTERY
		);

		vec3 ambient = mix(cc, cv, kw);

		//vec3 ambient = vec3(0.5569, 0.1255, 0.4118);
		vec3 diffuse = vec3(0.4, 0.4, 0.4);
		vec3 rimLight = vec3(0.6)*rim;

		vec3 finalCol = clamp(
			ambient +
			diffuse * diff +
			spec +
			rimLight,
			0.0, 1.0
		);

		col = finalCol;

	}

	//col *= sqrt(col);

	fragColor = vec4(col, 1);

}