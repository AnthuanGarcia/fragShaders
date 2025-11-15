#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x / u_resolution.y
#define PI 3.14159265
#define D2R 0.0174532925

mat2 rot2D(float angle) {
	float c = cos(angle), s = sin(angle);
	return mat2(c, s, -s, c);
}

vec3 getGradient(vec2 uv) {
    // Simple smooth gradient
    vec3 col1 = vec3(0.0, 0.4, 0.8); // blue
    vec3 col2 = vec3(0.9, 0.1, 0.4); // pink
    vec3 col3 = vec3(1.0, 0.6, 0.3); // orange
    
    float t = smoothstep(0.0, 0.5, uv.x) * (1.0 - smoothstep(0.5, 1.0, uv.x));
    vec3 mix1 = mix(col1, col2, smoothstep(0.0, 0.5, uv.x));
    vec3 mix2 = mix(col2, col3, smoothstep(0.5, 1.0, uv.x));
    return mix(mix1, mix2, smoothstep(0.3, 0.7, uv.x));
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv -= 0.5;  
    uv.x *= u_resolution.x / u_resolution.y; // keep aspect ratio
    uv += 0.5;

    // Vertical ribs
    float ribCount = 20.0;
    float ribWidth = 1.0 / ribCount;
    float ribPos = fract(uv.x * ribCount);
    
    // Create soft "lens" displacement
    float displacement = (ribPos - 0.5) * 0.15; 
    displacement *= smoothstep(0.0, 0.5, ribPos) * smoothstep(1.0, 0.5, ribPos);

    // Apply refraction offset
    vec2 refractUV = uv + vec2(displacement, 0.0);

    vec3 color = getGradient(refractUV);

    fragColor = vec4(color, 1.0);
}