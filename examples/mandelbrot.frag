#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718

#define MAX_ITERS 64
#define SQR_CMP(z) vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y )

float MandelBrot(vec2 uv) {

    vec2 z = vec2(0);

    for (int i = 0; i < MAX_ITERS; i++) {

        z = SQR_CMP(z) + uv;

        if ( length(z) > 2.0)
            return float(i) / float(MAX_ITERS);

    }

    return float(MAX_ITERS);

}

void main() {

    vec2 uv = gl_FragCoord.xy/u_resolution * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    uv.x -= 0.5;
    //uv.y += 0.5;

    vec3 col = vec3(0);
    
    float intesity = MandelBrot(uv);
    float ff = pow( intesity, -intesity );

    col += intesity * ff;

    gl_FragColor = vec4(col, 1.0);
}