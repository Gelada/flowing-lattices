// Stored values

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec4 col = vec4(1.,.5,.5,1.);
    vec2 mp = iMouse.xy/iResolution.xy;
    
    // Update the lattice
    if(fragCoord.y == 1.5 && fragCoord.x < 4.)
    {
        vec3 M1 = lat1;
        vec3 M2 = lat2;
        vec3 M3 = lat3;
        
        if(iFrame > 0)
        {
            M1 = texelFetch(notshaders, ivec2(1,1), 0).xyz;
            M2 = texelFetch(notshaders, ivec2(2,1), 0).xyz;
            M3 = texelFetch(notshaders, ivec2(3,1), 0).xyz;
            
            mat3 m = flow3g(.003, 5.*(mp.x-.5),mp.y);
            
            M1 = m*M1;
            M2 = m*M2;
            M3 = m*M3;   
        }
        
        reduceLattice(M1,M2,M3); 
        if(fragCoord.x == 1.5) { col = vec4(M1,0); }
        if(fragCoord.x == 2.5) { col = vec4(M2,0); }
        if(fragCoord.x == 3.5) { col = vec4(M3,0); }      
    }
       
    fragColor = col;
}