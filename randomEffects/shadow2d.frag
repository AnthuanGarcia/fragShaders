#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define LIM_VAL 0.001
#define EPS     1E-4

float scene(vec2 p) {
	
	p = abs(p);
	return max(p.x, p.y) - 0.15;

}

float shadow(vec2 light, vec2 pos, float hard) {

	vec2  d = light - pos;
	float l = length(d), res = 1.0;
    
    for (float t = LIM_VAL, h; t < l; t += h) {

        h = scene(pos + d/l*t);
        if( h < EPS ) return 0.;
        res = min( res, hard*h/t );

    }

    return res;

}

void main() {

	vec2 uv = 2.0*(gl_FragCoord.xy / u_resolution) - 1.0;

	vec2 light = vec2(2.0*cos(u_time), 2.0*sin(u_time));

	vec3 col = vec3(0.5);

	if (scene(uv) < 0.0) {

		col = vec3(1, 0, 0);

	}

	float shadow = shadow(light, uv, 50.0);

	col += shadow;

	fragColor = vec4(col, 1);

}