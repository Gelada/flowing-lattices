void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    
    float r = .16;
    vec2 uv = (fragCoord - 0.5*iResolution.xy) / iResolution.y;

    vec3 M1 = texelFetch(notshaders, ivec2(1,1), 0).xyz;
    vec3 M2 = texelFetch(notshaders, ivec2(2,1), 0).xyz;
    vec3 M3 = texelFetch(notshaders, ivec2(3,1), 0).xyz;
    
    mat3 L = mat3(M1,M2,M3);

    // Simple camera
    float camdist = 12.;
    vec3 ro = vec3(0.0, 0.0, -camdist);
    vec3 rd = getRayDir(uv, 1.);

    // Raymarch
    float startd = camdist/rd.z;
    startd = 0.;

    float t = 0.;
    float hit = 0.0;
    vec3  p;
    vec3 lat;
    
    int draw = 100;

    for (int it = 0; it < draw*2; it++)
    {
        p = ro + (t+startd)*rd;
        float d = sdLatticeBalls(L, p, r, lat);

        if (d < 0.) { d = -3.*r; }
        else if (d < .005) { hit = 1.0; break; }
       
        t += d * 0.95;
        if (t+startd > float(draw)) break;
    }

    vec3 col = vec3(1.0);

    if (hit > 0.5)
    {
        vec3 n = normalize(p-lat);
        vec3 l = vec3(0.,0.,-100.);
        
        l = normalize(l-p);
        float light = dot(n,l)*0.9 + 0.1;
        
        col = vec3(.1+light*.7,0.05,0.04);
        
        float B = min(min(length(lat), length(lat-M1)), min(length(lat-M2), length(lat-M3)));
        
        B = min(min(B, length(lat+M1)), min(length(lat+M2), length(lat+M3)));
        
        if( B < .1 ) { col = vec3(0.04, .05,.1+light*.7); }
        col = mix(col, backCol.xyz, t/float(draw));
    }


    fragColor = vec4(col, 1.0);
}