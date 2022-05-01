#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define SRGB_TO_LINEAR(c) pow((c), vec3(2.2, 2.2, 2.2))
#define LINEAR_TO_SRGB(c) pow((c), vec3(1.0 / 2.2, 1.0/2.2, 1.0/2.2))
#define SRGB(r, g, b) SRGB_TO_LINEAR(vec3(float(r), float(g), float(b)) / 255.0)

mat2 rotate90 = mat2(
    0, 1,
    -1, 0
);

float plot(float uv, float thick) {

    return smoothstep(thick, 0.0, abs(uv));

}

vec2 noise_2(vec2 p) {

    return fract(
        sin(
            vec2(
                dot(p, vec2(130.7, 541.2) ),
                dot(p, vec2(696.69, 101.4))
            )
        ) * 679812.7684
    );

}

float noise_1(vec2 st) {

    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );

}

// Gradient noise from Jorge Jimenez's presentation:
// http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare
float gradientNoise(in vec2 uv) {

    const vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
    return fract(magic.z * fract(dot(uv, magic.xy)));

}

vec3 gradient(vec3 color0, vec3 color1) {

    vec2 a; // First gradient point.
    vec2 b; // Second gradient point.

    a = 0.1 * u_resolution.xy;
    b = u_resolution.xy;

    // Calculate interpolation factor with vector projection.
    vec2 ba = b - a;
    float t = dot(gl_FragCoord.xy - a, ba) / dot(ba, ba);

    // Saturate and apply smoothstep to the factor.
    t = smoothstep(0.0, 1.0, clamp(t, 0.0, 1.0));

    // Interpolate.
    vec3 color = mix(color0, color1, t);

    // Convert color from linear to sRGB color space (=gamma encode).
    color = LINEAR_TO_SRGB(color);

    // Add gradient noise to reduce banding.
    color += (1.0/255.0) * gradientNoise(gl_FragCoord.xy) - (0.5/255.0);

    return color;

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv -= 0.5;
    uv *= 7.0;
    uv.x *= u_resolution.x/u_resolution.y;

    vec2 uv2 = uv;
    vec2 uv3 = uv;

    vec3 col;
    
    vec3 grad = gradient(
        vec3(0.57, 1.0, 0.0),
        vec3(0.27, 0.0, 1.0)
    );

    vec2 fpos = fract(uv * 1.2);
    vec2 ipos = floor(uv * 1.5);

    float minDist = 10.0;

    for (int y = -1; y <= 1; y++) {

        for (int x = -1; x <= 1; x++) {

            vec2 nei = vec2(float(x), float(y));
            vec2 point = noise_2(ipos + nei);

            point = 0.5*sin(u_time + point*9.0) + 0.5;
            
            vec2 diff = nei + point - fpos;
            float dist = length(diff);

            minDist = min(minDist, dist);

            uv2.y -= (uv2.x - minDist);
            uv3.y -= (uv3.x + minDist);

            float a = uv2.y * uv3.y;

            col += (
                plot(uv2.y, 0.035) +
                plot(uv3.y, 0.035) +
                plot(a, 0.035)
            ) * grad;

        }

    }
    
    //col += minDist;

    gl_FragColor = vec4(col, 1.0);
}