vec2 coords(in vec2 fragCoord, in vec3 res, in float sc, in vec2 offset)
{
    return sc * (fragCoord - offset) / res.y;
}

vec2 iCoords(in vec2 p, in vec3 res, in float sc, in vec2 offset)
{
    return res.y * p / sc + offset;
}
