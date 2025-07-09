#version 300 es

precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

out vec4 fragColor;

#define ASPECT u_resolution.x/u_resolution.y
#define PI 3.14159265
#define D2R.0174532925

float noise(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*403758.5453123);
}

float smoothnoise(vec2 st){
    
    vec2 ipos=floor(st);
    vec2 fpos=fract(st);
    
    fpos=fpos*fpos*(3.-2.*fpos);
    
    float bl=noise(ipos);
    float br=noise(ipos+vec2(1,0));
    float b=mix(bl,br,fpos.x);
    
    float tl=noise(ipos+vec2(0,1));
    float tr=noise(ipos+vec2(1));
    float t=mix(tl,tr,fpos.x);
    
    return mix(b,t,fpos.y);
    
}

float randomRange(in vec2 seed,in float min,in float max){
    return min+smoothnoise(seed)*(max-min);
}

float fbm( vec2 p, float min, float max ) {

    float value = 0.0;
    float amp   = 0.5;

    const mat2 m = mat2(
        0.5, 0.5,
        0.1, -1.1
    );

    for (int i = 0; i < 4; i++) {

        value += amp * randomRange(p, min, max);
        p = p * m;
        amp *= 0.5;

    }

    return value / 0.975;

}

mat2 rot2D(float angle){
    float c=cos(angle),s=sin(angle);
    return mat2(c,s,-s,c);
}

float circle(vec2 p,float r){
    return length(p)-r;
}

float square(vec2 p,float l){
    p=abs(p);
    return max(p.x,p.y)-l;
}

void main(){
    
    vec2 uv=2.*(gl_FragCoord.xy/u_resolution)-1.;
    uv.x*=ASPECT;
    
    vec3 col=vec3(1.0, 1.0, 1.0);
    
    vec2 a = uv + vec2(0, u_time * 0.025);
    vec2 b = uv + vec2(0, noise(uv) * 0.3 + u_time * 0.05);
    vec2 c = uv + vec2(0, u_time * 0.05);

    float density = 0.45;
    float density1 = 0.45;
    float density2 = 0.45;

    float n = randomRange(a * 250.0,density-0.5,density) * 2.0;
    float n1 = randomRange(b * 100.0,density1-0.5,density1) * 2.0;
    float n2 = randomRange(c * 50.0 * noise(floor(uv*250.0)) ,density2-0.3,density2);

    col = mix(
        col,
        vec3(0.0, 0.0, 0.0),
        clamp(uv.y+n,0.,1.) * (1.0 - step(0.2, abs(uv.x))) * (1.0 - step(0.85, abs(uv.y)))
    );

    col = mix(
        col,
        vec3(1.0, 0.3725, 0.949),
        clamp(-uv.y+n1,0.,1.) * (1.0 - step(0.2, abs(uv.x - 0.6))) * (1.0 - step(0.85, abs(uv.y)))
    );

    col = mix(
        col,
        vec3(0.098, 0.0, 1.0),
        clamp(-uv.y+n2,0.,1.) * (1.0 - step(0.2, abs(uv.x + 0.6))) * (1.0 - step(0.85, abs(uv.y)))
    );

    fragColor=vec4(col,1);
    
}
