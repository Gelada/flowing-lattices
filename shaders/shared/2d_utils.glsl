vec4 drPt(in vec4 pC, in vec2 p, in vec4 pt, in float r, in vec4 c, in float exp)
{
    vec4 oC = pC;
    float l = length(p - pt.xy);
    if (l < r) { oC = mix(pC, c, pow((r-l)/r, exp)); }
    return oC;
}

vec4 drGrid(in vec4 pC, in vec2 p, in mat2 m, in float r, in vec4 c, in float exp)
{
    vec4 oC = pC;
    mat2 im = inverse(m);
    float l = length(p - m * round(im * p));
    if (l < r) { oC = mix(pC, c, pow((r-l)/r, exp) * c.a); }
    return oC;
}

vec4 blur(sampler2D image, vec2 uv, vec2 resolution) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.3333333333333333, 0) / resolution;
    vec2 off2 = vec2(0, 1.3333333333333333) / resolution;
    color += texture(image, uv) * 0.641984;
    color += texture(image, uv + off1) * 0.0796275;
    color += texture(image, uv - off1) * 0.0796275;
    color += texture(image, uv + off2) * 0.0796275;
    color += texture(image, uv - off2) * 0.0796275;
    color += texture(image, uv + off1 + off2) * 0.00987648;
    color += texture(image, uv - off1 + off2) * 0.00987648;
    color += texture(image, uv + off1 - off2) * 0.00987648;
    color += texture(image, uv - off1 - off2) * 0.00987648;
    return color;
}
