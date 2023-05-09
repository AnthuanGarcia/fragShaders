#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define DEG2R 0.01745329
//#define BATTERY (0.5*sin(u_time*0.5)+0.5)
#define BATTERY 0.0

#define RX 1.0 / min(u_resolution.x, u_resolution.y)

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, p);

}

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

vec2 boxIntersection( in vec3 ro, in vec3 rd, vec3 boxSize, out vec3 outNormal ) 
{
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    outNormal = (tN>0.0) ? step(vec3(tN),t1) : // ro ouside the box
                           step(t2,vec3(tF));  // ro inside the box
    outNormal *= -sign(rd);
    return vec2( tN, tF );
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

	vec3 col = vec3(0.95);

	vec3 ro = vec3(0, 0, -1.5);
	vec3 rd = normalize(vec3(uv, 1.0));

    float IOR = 1.0;

	float r = 0.2 + 0.3*smoothNoise(uv*4.0 + u_time);
    float i = 0.0;
    vec3 sun = vec3(50.0, 100, 50.0);

   ro.xz *= rot2D(u_time);
   rd.xz *= rot2D(u_time);

    for(;i < 6.0; i++) {

        vec3 normal;
        
        vec2 box = boxIntersection(ro, rd, vec3(0.5), normal);        
        vec2 sph0 = sphIntersect(ro, rd, vec3(0, 0, 0), 0.25);

        if (box.x > 0.0) {

            vec3 p = ro + rd*box.x;
            vec3 n = normal;

            vec3 rIn = refract(rd, n, 1.0 / IOR);
            vec2 hIn = boxIntersection(p - n * 0.003, rIn, vec3(0.6), n);
            vec3 pIn = p + rIn * -hIn.x;
            //vec3 nIn = -normalize(pIn);
            boxIntersection(pIn, rIn, vec3(0.6), n);
            vec3 nIn = -n;

            vec3 rOut = vec3(0);
            float shift = 0.01;

            rOut = refract(rIn, nIn, IOR);

            if (dot(rOut, rOut) == 0.0)
                rOut = reflect(-rIn, nIn);

            ro = pIn - nIn * 0.03;
            rd = rOut;

            //col *= vec3(1, 0, 0);

        }

        if (sph0.x > 0.0) {

            vec3 pos = ro + rd*sph0.x;
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
                spec,
                //rimLight,
                0.0, 1.0
            );

            col = finalCol;

            break;

        }
    }

	//col *= sqrt(col);

	fragColor = vec4(col, 1);

}