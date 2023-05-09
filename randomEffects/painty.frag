#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

void main() {

	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy)/u_resolution.y;
	vec2 mou = (u_mouse - 0.5 * u_resolution) / u_resolution.y;

	vec3 col = vec3(1);

	vec2 a = vec2(0.2 , 0.2),
	b = vec2(0.2, -0.2),
	c = vec2(-0.2, -0.2),
	d = vec2(-0.2, 0.2);

	a = mou;

	vec4 l = vec4(
		(a.y - b.y)*uv.x + (b.x - a.x)*uv.y + (a.x*b.y - b.x*a.y),
		(b.y - c.y)*uv.x + (c.x - b.x)*uv.y + (b.x*c.y - c.x*b.y),
		(c.y - d.y)*uv.x + (d.x - c.x)*uv.y + (c.x*d.y - d.x*c.y),
		(d.y - a.y)*uv.x + (a.x - d.x)*uv.y + (d.x*a.y - a.x*d.y)
	);

	vec4 lm = vec4(
		step(min(a.y, b.y), uv.y) * step(uv.y, max(a.y, b.y)),
		step(min(b.x, c.x), uv.x) * step(uv.x, max(b.x, c.x)),
		step(min(c.y, d.y), uv.y) * step(uv.y, max(c.y, d.y)),
		step(min(d.x, a.x), uv.x) * step(uv.x, max(d.x, a.x))
	);

	col -= 
		max(
			(plot(abs(l.x), 0.001) * lm.x),
			max(
				(plot(abs(l.y), 0.001) * lm.y),
				max(
					(plot(abs(l.z), 0.001) * lm.z),
					(plot(abs(l.w), 0.001) * lm.w)
				)
			)
		)
	;

	fragColor = vec4(col, 1);

}