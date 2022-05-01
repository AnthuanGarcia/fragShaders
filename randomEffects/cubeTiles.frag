#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define LINES 0
//#define LINES 1

#define ZOOM      6.0
#define THICKNESS 0.02
#define RX        1.0 / min(u_resolution.x, u_resolution.y)

#define FST_COLOR vec3(0.0, 1.0, 0.83)
#define SND_COLOR vec3(1.0, 0.53, 0.77)

//#define FILL(a, b, c) step(-0.17, -abs(tiles.x*0.6666 + a)) * step(-0.332, -abs(tiles.y + b - (tiles.x + c)*0.6666 ))
#define FILL(p, c, l) plot( max(abs(p.x), abs( p.x - (1.5*p.y) )) - 0.5, 0.0) * smoothstep(0.0, 0.025, p.x) * smoothstep(c, l, -p.y)

vec3 linearGradient(float yCoord, float posCol, float posCol2) {

    return mix(
        FST_COLOR * (0.5*sin(u_time) + 0.4),
        SND_COLOR * (0.5*cos(u_time) + 0.4),
        smoothstep(posCol, posCol2, yCoord)
    );

}

float plot(float p, float t) {

    return 1.0 - smoothstep(t - RX * (0.5 + ZOOM), t + RX * (0.5 + ZOOM), p);

}

float hex(in vec2 p, in float w) {

    vec2 q = abs(p);
    return max((q.x*0.75 + q.y*0.5), q.y) - w * 0.5;

}

float poorCube(vec2 uv, float s) {

    float cube = plot(abs(hex(uv.yx, 1.0)), THICKNESS);

#if LINES

    uv.y += s*abs(uv.x*0.6666);

    float cropDiags = step(-0.5, -abs(uv.x));
    cube += plot(abs(uv.y), THICKNESS) * cropDiags;

    float cropCenter = step(s*0.26, s*abs(uv.y + 0.26));
    cube += plot(abs(uv.x), THICKNESS) * cropCenter;

#endif

    return cube;

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.y;

    vec3 backCol = linearGradient(uv.y, -0.35, 1.0);
    //vec3 backCol = 1.0-vec3(1);

    //uv.x *= u_resolution.x / u_resolution.y;
    uv *= ZOOM;

    uv += (u_mouse/u_resolution) * ZOOM;
    uv += 0.5*u_time;

    vec2 tiles    = fract(uv);
    float evenY   = mod( ceil(uv.y), 2.0 );
    vec2 tilesInv = fract(-uv);

    /*vec2 aaa = tiles - vec2(0.5, 0.165);
    vec2 aa = tilesInv - vec2(0.5, 0.165);

    float a = plot(
        max(abs(aaa.x), abs( aaa.x - (1.5*aaa.y) )) - 0.5,
        0.0
    ) * smoothstep(0.0, 0.01, aaa.x) * smoothstep(0.166, 0.165, -aaa.y);

    aa *= mat2( -1, 0, 0, -1);
    aa += vec2(0.5, 0.666);

    float a2 = plot(
        max(abs(aa.x), abs( aa.x - (1.5*aa.y) )) - 0.5 ,
        0.0
    ) * smoothstep(0.0, 0.01, aa.x);

    vec2 aatri = tilesInv + vec2(-0.5, 0.5);
    vec2 aatri2 = tilesInv + vec2(0.0, 0.5);

    aatri *= mat2(-1, 0, 0, -1);
    aatri2 *= mat2(-1, 0, 0, -1);

    aatri += vec2(0.5, 0.3);
    aatri2 += vec2(0.5, 0.3);

    float aTri = plot(
        max(abs(aatri.x), abs( aatri.x - (1.5*aatri.y) )) - 0.5,
        0.0
    ) * smoothstep(0.0, 0.01, aatri.x);

    float aTri2 = plot(
        max(abs(aatri2.x), abs( aatri2.x - (1.5*aatri2.y) )) - 0.5 ,
        0.0
    ) * smoothstep(0.0, 0.01, aatri2.x);
    */
    
    mat2 r = mat2( -1, 0, 0, -1);

    float fillFace   = FILL( (tiles     - vec2(0.5, 0.165)) , 0.166, 0.165 );
    float fillFace2  = FILL( ((tilesInv - vec2(0.5, 0.165)) * r + vec2(0.5, 0.666) ), 1.0, 0.0);
    float stupidTri  = FILL( ((tilesInv + vec2(-0.5, 0.5))  * r + vec2(0.5, 0.333) ), 1.0, 0.0);
    float stupidTri2 = FILL( ((tilesInv + vec2(0.0, 0.5))   * r + vec2(0.5, 0.333) ), 1.0, 0.0);

    //float fillFace   = FILL(-0.5,    0.165,  0.0);
    //float fillFace2  = FILL(-0.165, -0.165,  0.0);
    //float stupidTri  = FILL( 0.0,   -1.165,  0.0);
    //float stupidTri2 = FILL(-0.5,   -1.165, -0.5);

    vec3 col = vec3(1);

    float lines, linesOdd;

#if LINES

    float crop = step(0.8, tiles.y);

    lines = ( plot(abs(tiles.x - 1.0), THICKNESS) + plot(abs(tiles.x), THICKNESS) ) * crop;
    linesOdd = plot(abs(tiles.x - 0.5), THICKNESS) * crop;

#endif

    col -= ( poorCube(tiles - 0.5, -1.0) + lines + 
             backCol * (fillFace + stupidTri) ) * step(1.0, evenY) +
//
           ( poorCube(tiles    - vec2(0.0, 0.50), -1.0) +
             poorCube(tilesInv - vec2(0.0, 0.50),  1.0) +
             linesOdd + 
             backCol * (fillFace2 + stupidTri2) ) * step(0.0, -evenY);    
    
    /*col -= ( poorCube(tiles - 0.5, -1.0) + lines + 
             backCol * (a + aTri) ) * step(1.0, evenY) +
           ( poorCube(tiles    - vec2(0.0, 0.50), -1.0) +
             poorCube(tilesInv - vec2(0.0, 0.50),  1.0) +
             linesOdd + 
             backCol * (a2 + aTri2) ) * step(0.0, -evenY);
    */
    gl_FragColor = vec4(col, 1.0);

}