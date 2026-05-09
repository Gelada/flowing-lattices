//vec3 lat1 = vec3(1.,1.618033988749895,-1.618033988749895);
//vec3 lat2 = vec3(1.618033988749895,1.,-1.618033988749895);
//vec3 lat3 = vec3(1.618033988749895,1.618033988749895,1.);

vec3 lat1 = vec3(1.,0.,0.);
vec3 lat2 = vec3(-.5,0.866,.9);
vec3 lat3 = vec3(-.5,-0.8659,.99);
//vec3 lat1 = vec3(.25,0.,0.);
//vec3 lat2 = vec3(0.,2.,0.);
//vec3 lat3 = vec3(0.,0.,2.);

vec4 dotCol = vec4(.8,.05,.04,1.);
vec4 backCol = vec4(1.,1.,1.,0);
vec4 basisCol = vec4(.651,.669,.95,1.);

mat3 flow3g(in float dTime, float a, float s)
{

    float s1 = exp(dTime*s);
    float s2 = exp(dTime*(1.-s));
    
    return mat3(
        s1*cos(a*dTime),s2*sin(a*dTime),0.,
        -s1*sin(a*dTime),s2*cos(a*dTime),0.,
        0.,0.,exp(-dTime)
    );
}

mat3 flow3h(in float dTime, float a, float s)
{    
    return mat3(
       1.,dTime,dTime*dTime/2.,
       0.,1.,dTime,
        0.,0.,1.
    );
}

float sdSphere(vec3 p, float r) { return length(p) - r; }

// Distance to sphere centered at closest lattice point.
float sdLatticeBalls(mat3 L, vec3 p, float r, out vec3 lat)
{
    mat3 Linv = inverse(L);

    vec3 q = Linv * p;         // lattice coordinates
    vec3 n = floor(q + 0.5);   // nearest integer lattice point

    float d = 1e9;

    lat = L*n;
    
    return sdSphere(p - lat, r);
}

vec3 getRayDir(vec2 uv, float fov)
{
    // uv is on shader plane; camera looks down +z
    return normalize(vec3(uv, fov));
}
void reducePair(inout vec3 bi, vec3 bj)
{
    float m = round(dot(bi, bj) / dot(bj, bj));
    bi -= m * bj;
}

void reduceLattice(inout vec3 b0,
                   inout vec3 b1,
                   inout vec3 b2)
{
    // fixed number of passes is sufficient in practice
    for (int k = 0; k < 100; ++k)
    {
        reducePair(b0, b1);
        reducePair(b0, b2);

        reducePair(b1, b0);
        reducePair(b1, b2);

        reducePair(b2, b0);
        reducePair(b2, b1);
    }
}