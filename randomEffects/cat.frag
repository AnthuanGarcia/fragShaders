#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

#define COLOR 1

#define ZOOM 2.0
#define ELLIPSE(sxy, p, l) length(p * sxy) - l
#define PI_OVER_12  0.261799

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

}

mat2 rot2D(float angle, float clock) {

    vec2 rot = vec2(cos(angle), sin(angle));

    return mat2(
        rot[0], clock*rot[1],
        -clock*rot[1], rot[0]
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

/* --- From https://iquilezles.org/articles/distfunctions2d/ --- */

float triangleIso(vec2 p, vec2 q) {

    p.x = abs(p.x);
	vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
    vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
    float k = sign( q.y );
    float d = min(dot( a, a ),dot(b, b));
    float s = max( k*(p.x*q.y-p.y*q.x),k*(p.y-q.y)  );
	return sqrt(d)*sign(s);

}

float segment(vec2 p, vec2 a, vec2 b) {

    vec2 ba = b-a;
    vec2 pa = p-a;
    float h =clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length(pa-h*ba);

}

float parabola(vec2 pos, float wi, float he) {

    pos.x = abs(pos.x);

    float ik = wi*wi/he;
    float p = ik*(he-pos.y-0.5*ik)/3.0;
    float q = pos.x*ik*ik*0.25;
    float h = q*q - p*p*p;
    
    float x;
    if( h>0.0 ) // 1 root
    {
        float r = sqrt(h);
        x = pow(q+r,1.0/3.0) - pow(abs(q-r),1.0/3.0)*sign(r-q);
    }
    else        // 3 roots
    {
        float r = sqrt(p);
        x = 2.0*r*cos(acos(q/(p*r))/3.0); // see https://www.shadertoy.com/view/WltSD7 for an implementation of cos(acos(x)/3) without trigonometrics
    }
    
    x = min(x,wi);
    
    return length(pos-vec2(x,he-x*x/ik)) * 
           sign(ik*(pos.y-he)+pos.x*pos.x);

}

float arc(vec2 p, vec2 sc, float ra, float rb) {
    p.x = abs(p.x);
    return ((sc.y*p.x>sc.x*p.y) ? length(p-sc*ra) : 
                                  abs(length(p)-ra)) - rb;
}

/* ------------------------------------------------------------- */

float face1(vec2 uv) {

    return plot(
        segment(uv + vec2(0.175, -0.03), vec2(0.0, 0.07), vec2(0)) - 0.015,
        0.0
    ) + 
    plot(
        segment(uv - vec2(0.175, 0.03), vec2(0.0, 0.07), vec2(0)) - 0.015,
        0.0
    ) +
    plot(
        triangleIso(uv + vec2(0, 0.02), vec2(0.025, 0.035)) - 0.02,
        0.0
    ) +
    plot(
        abs(parabola(uv + vec2(0.1, 0.05), 0.1, -0.05)),
        0.012
    ) +
    plot(
        abs(parabola(uv - vec2(0.1, -0.05), 0.1, -0.05)),
        0.012
    ) + 
    plot(
        abs(triangleIso(uv + vec2(0.12, 0.15), vec2(0.025, 0.05))),
        0.007
    );

}

float face2(vec2 uv) {

    return plot( length(uv + vec2(0.2, -0.06)) - 0.02, 0.0 ) +
    plot( length(uv - vec2(0.2, 0.06)) - 0.02, 0.0 ) +
    plot( abs(ELLIPSE(vec2(0.7, 1.0), (uv - vec2(0, 0.03)), 0.03)), 0.0075 ) +
    plot( abs(arc(uv - vec2(0.085, 0.02), vec2(-0.5, 0.1), 0.085, 0.0)), 0.01) + 
    plot( abs(arc(uv + vec2(0.085, -0.02), vec2(-0.5, 0.1), 0.085, 0.0)), 0.01);

}

float face3( vec2 uv ) {

    return plot( length(uv - vec2(0.25, -0.05)) - 0.025, 0.0 ) +
    plot( length(uv + vec2(0.25, -0.065)) - 0.025, 0.0 ) +
    plot( ( ELLIPSE(vec2(0.7, 1.0), uv, 0.075) ) , 0.01 ) +
    plot( abs( segment(uv + vec2(0.05, 0.15 ), vec2(0.0, 0.15), vec2(0)) - 0.04) , 0.01);

}

float catHead(vec2 uv) {

    const mat2 r30 = mat2(
        0.866025, 0.5,
        -0.5, 0.866025
    );

    const mat2 r30inv = mat2(
        0.866025, -0.5,
        0.5, 0.866025
    );

    return max(
        plot( ( ELLIPSE(vec2(0.7, 1.0), uv, 0.25) ), 0.01 ),
        plot( (triangleIso(-uv*r30 + vec2(-0.1, 0.4), vec2(0.075, 0.15)) - 0.005), 0.01 ) +
        plot( (triangleIso(-uv*r30inv + vec2(0.1, 0.4), vec2(0.075, 0.15)) - 0.005), 0.01 )
    );

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.y;
    uv *= ZOOM;

    float eveny = mod(floor(uv.y), 2.0);
    uv.x += 0.25 * sign(eveny - 0.5) * u_time;

    vec2 ipos = floor(uv);
    vec2 fpos = fract(uv) - 0.5;

    float id = noise_1(ipos);
    float face = 0.0;

    mat2 r = rot2D(PI_OVER_12 * sin(2.50*id*u_time), sign( step(0.5, id) - 0.5 ) );
    fpos *= r * step(0.3, id) + mat2(1, 0, 0, 1) * step(-0.3, -id);

    if (id < 0.45)
        face = face1(fpos);
    else if (id < 0.9)
        face = face2(fpos);
    else 
        face = face3(fpos);

#if COLOR

    vec3 col = mix(
        vec3(0.7529, 0.9451, 0.8471),
        vec3(0.9569, 0.8275, 0.9451),
        0.5*sin(0.5*u_time) + 0.5
    );

#else

    vec3 col = vec3(1);
    col = mix(col, vec3(0), catHead(fpos * 0.94));
    
#endif

    col = mix(col, vec3(0), smoothstep(0.2, -0.45, ELLIPSE(vec2(0.75, 1.0), (fpos + 0.03), 0.175 ) ) );
    col = mix(col, vec3(1), catHead(fpos));
    col = mix(col, vec3(0), face);

    fragColor = vec4(col, 1);

}