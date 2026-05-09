vec2 cDiv(vec2 a, vec2 b)
{
    return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b, b);
}

vec4 hpPt(in vec2 b1, in vec2 b2)
{
    vec4 pt;
    if (length(b1) > length(b2)) {
        pt = vec4(cDiv(b1, b2), 0, 0);
    } else {
        pt = vec4(cDiv(b2, b1), 0, 0);
    }
    if (pt.y < 0.) { pt = -pt; }
    return pt;
}

bool uCellTest(vec2 p)
{
    return length(p)>=1. && p.x>=-.5 && p.x < .5;
}

bool seriesCellTest(vec2 p)
{
    return length(p-vec2(0.5,0.))>=.5 && p.x>=0. && p.x < 1.;
}
