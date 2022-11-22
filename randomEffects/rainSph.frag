#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y

struct layerInfo {
	vec2  uv;
	float zoom;
	float lim;
	vec2 radRange;
	vec2 offset;
};

layerInfo[3] layers;

float noise(vec2 st) {

    return fract(sin( dot( st.xy, vec2(12.9898,78.233) ) ) * 43758.5453123);

}

float randomRange (in vec2 seed, in float min, in float max) {
	return min + noise(seed) * (max - min);
}

float sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{

    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;

    return h < 0.0 ? -1.0 : -b - sqrt( h );

}

vec4 creatLayer(inout layerInfo l) {

	l.uv *= l.zoom;
	l.uv += l.offset;

	vec2 fpos = fract(l.uv);
	vec2 ipos = floor(l.uv);

	float id = noise(ipos);

	vec4 res;

	if (id > l.lim) {

		vec3 ro = vec3(0, 0, -1);
		vec3 rd = normalize(vec3(fpos - 0.5, 1));

		float rad = randomRange(ipos, l.radRange.x, l.radRange.y);
		float t = sphIntersect(ro, rd, vec3(0), rad);

		vec3 pos = ro + rd*t;

		vec3 n = normalize(pos);
		vec3 lightDir = normalize(vec3(-150, 150, -100) - pos);
		//vec3 viewPos = normalize(ro - pos);


		//float rim = 1.0 - dot(viewPos, n);
		//vec3 rimLight = vec3(1.0, 1.0, 1.0)*rim;

		float diff = max( dot(n, lightDir), 0.0 );
		diff = smoothstep(0.0, 0.7, diff);

		vec3 ambient = vec3(0.8902, 0.6078, 0.0039);

		vec3 diffuse = (vec3(0.996, 0.824, 0.243) - ambient) * diff;

		res = vec4(ambient + diffuse, step(0.0, t));

	}

	return res;

}

void main() {

	vec2 uv = gl_FragCoord.xy / u_resolution;
	uv.x *= ASPECT;

	vec3 col = vec3(0.996, 0.824, 0.243);

	layers[0].uv = uv + vec2(0.1*u_time, 0);
	layers[0].zoom = 3.0;
	layers[0].lim = 0.2;
	layers[0].radRange = vec2(0.1, 0.2);
	layers[0].offset = vec2(0);

	layers[1].uv = uv + vec2(0.25*u_time, 0.1*u_time);
	layers[1].zoom = 2.0;
	layers[1].lim = 0.8;
	layers[1].radRange = vec2(0.21, 0.3);
	layers[1].offset = vec2(0.5, -0.25);

	layers[2].uv = uv + vec2(0.1*u_time, 0.5*u_time);
	layers[2].zoom = 1.0;
	layers[2].lim = 0.7;
	layers[2].radRange = vec2(0.31, 0.45);
	layers[2].offset = vec2(0.76, 0.25);

	vec4 layer1 = creatLayer(layers[0]);
	vec4 layer2 = creatLayer(layers[1]);
	vec4 layer3 = creatLayer(layers[2]);

	col = mix(
		col,
		layer1.rgb,
		layer1.w
	);

	col = mix(
		col,
		layer2.rgb,
		layer2.w
	);

	col = mix(
		col,
		layer3.rgb,
		layer3.w
	);

	//}

	fragColor = vec4(col, 1);

}