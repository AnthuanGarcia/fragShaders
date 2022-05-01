    /*float movx = noise_1(floor(uv));
    float movy = noise_1(floor(uv + 5.0));

    float aux = noise_1(uv * 10.0);
    float auy = noise_1(uv + 50.0);

    float x = 0.1*step(0.5, movx) + 0.2*step(-0.5, -movx);
    float y = 0.1*step(0.5, movy) + 0.2*step(-0.5, -movy);

    vec2 circ = 0.2 *vec2(cos(0.5*u_time), sin(0.5*u_time)) * step(0.85, movx);
    float negate = step(-0.85, -movx);

    float intCircles = 
    plot(abs( CIRCLE(0.2, fpos + vec2(-x, 0)*negate + circ * vec2(aux, movy)  ) ), 0.01) + 
    plot(abs( CIRCLE(0.2, fpos + vec2(x, 0) *negate + circ * vec2(movx, auy) ) ), 0.01) + 
    plot(abs( CIRCLE(0.2, fpos + vec2(0, y) *negate + circ * vec2(movx, -auy) ) ), 0.01) +
    plot(abs( CIRCLE(0.2, fpos + vec2(0, -y)*negate + circ * vec2(-aux, movy) ) ), 0.01);
*/
