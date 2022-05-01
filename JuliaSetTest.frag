#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define I_MAX      64
#define C          vec2(-0.12256, 0.74486)
#define ER2        4.0
#define CMX_SQR(z) vec2(z.x*z.x - z.y*z.y, z.x*z.y*2.0)

void main() {
    
    vec2 z = gl_FragCoord.xy - u_resolution * 0.5;
    z *= 2.5 / min(u_resolution.x, u_resolution.y);
    vec3 col = vec3(1, z);

    float scale = 0.01;
    int count = 0;

    for (int i = 0; i < I_MAX; i++) {
        z = C + CMX_SQR(z);
        count = i;
        if (dot(z, z) > ER2) break;
    }

    if (count == I_MAX - 1)
        gl_FragColor = vec4(col, 1.0);
    else
        gl_FragColor = vec4(1.0 - float(count) * scale);

}