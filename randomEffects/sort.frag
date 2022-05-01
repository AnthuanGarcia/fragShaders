#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define ELEMENTS 8
#define RX       1.0 / min(u_resolution.x, u_resolution.y)
#define SEED     4.0
#define MOD_INT(a, b) a - b*(a/b)

int arr[ELEMENTS];
bool isSorted = true;
bool shuffled = false;

float fill(in float d) {

    return 1.0 - smoothstep(0.0, RX * 2.0, d);

}

float rectangle(vec2 uv, float w, float h) {

    return step(-w, -abs(uv.x)) * step(-h, -abs(uv.y));

}

float stroke(float d, float t) {

    return 1.0 - smoothstep(t - RX * 1.5, t + RX * 1.5, abs(d));

}

float noise1(vec2 st) {
    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898,78.233)
            )
        ) * 43758.5453123
    );
}

int randInt(int min, int max) {
    
    int res, low, hi;

    if (min < max) {

        low = min;
        hi = max + 1;

    } else {

        low = max + 1;
        hi = min;

    }

    int rand = int( noise1(vec2(u_time)) * 10.0 );

    return MOD_INT(rand, hi - low) + low;

}

void shuffle() {

    int j;
    
    for (int i = ELEMENTS; i > 1; i--) {

        int tmp = arr[randInt(0, i)];
        arr[randInt(0, i)] = arr[i-1];
        arr[i-1] = tmp;

    }

}

void bubbleSort() {

    for(int i = 0; i < ELEMENTS; i++)
        for (int j = 0; j < ELEMENTS; j++)
            if (arr[j] < arr[i]) {

                int temp = arr[j];
                arr[j] = arr[i];
                arr[i] = temp;

            }

}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution;
    //uv.x *= u_resolution.x / u_resolution.y;

    vec3 col;

    float width = 1.0/float(ELEMENTS);
    //float height, h;

    arr[0] = 1;
    arr[1] = 8;
    arr[2] = 3;
    arr[3] = 5;
    arr[4] = 6;
    arr[5] = 2;
    arr[6] = 7;
    arr[7] = 4;

    float wtf = width*0.5;
    vec2 offset = vec2(wtf, 0);

    for (int i = 0; i < ELEMENTS; i++) {

        col += rectangle(uv - offset, wtf, width*float(arr[i]));
        offset.x += width;

    }

    gl_FragColor = vec4(col, 1.0);

}