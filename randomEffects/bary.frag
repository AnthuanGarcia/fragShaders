#version 300 es

precision mediump float;
		
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
		
out vec4 fragColor;

float gridp(float x, float t) {

    float k = 0.5;
    float f = fract(x);
    
    return smoothstep(k - t, k, f) * (1.0 - smoothstep(k, k + t, f));

}

void main() {
		
	vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;
	uv *= 10.0;
	uv.x *= u_resolution.x / u_resolution.y;
		
	vec3 col = vec3(0);
	vec2 r  = vec2(uv.y); 
	vec2 r1 = vec2(-uv.x, uv.y), r2 = vec2(uv), r3 = vec2(0, -0.5);
	
	vec3 rx = vec3(r1.x, r2.x, r3.x);
	vec3 ry = vec3(r1.y, r2.y, r3.y);

	mat2 T = mat2(
		rx.xy - r3.x,
		ry.xy - r3.y
	);

	vec2 a = inverse(T)*(r - r3);

	vec3 lambda = vec3(a, 1.0 - a.x - a.y);

	vec2 bar = vec2(
		dot( rx + u_time, lambda ),
		dot( ry + u_time, lambda )
	);

	col += max(gridp(bar.x, 0.025), gridp(bar.y, 0.025));
		
	fragColor = vec4(col, 1);
		
}