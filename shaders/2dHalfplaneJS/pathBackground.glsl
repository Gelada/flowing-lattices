// Buffer for complete path record

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = coords(fragCoord, iResolution, 2., vec2(iResolution.x * 0.5, 0.0));
    
	vec2 uv = fragCoord / iResolution.xy;
    
    vec4 col;
    
    if(iFrame == 0 || uv.x > 1. || uv.y > 1. || uv.x < 0. || uv.y < 0. || iMouse.z > 0.) 
    { 
        col = vec4(1.,1.,1.,1.); 
        float len = length(p); } 
    else
    {
    	col = texture(pathBackground,uv);
        col = mix(backCol,col,backFadeHp);

        vec4 recCol = vec4(0.,0.,0.5,1.);

        if(uNewLattice && col.z < 1.) { col = mix(backCol,recCol,1.-col.z); }
        //if(uNewLattice) { col = col*vec4(0.,1.,0.,1.);}

    	vec2 b1 = uLattice.xy;
    	vec2 b2 = uLattice.zw;

        vec4 pt = hpPt(b1, b2);
    	col = drPt(col, p, pt, pt.y/100., mix(col,traceCol,traceLevel), .5);
        col = drPt(col, p+vec2(1.,0.), pt, pt.y/100., mix(col,traceCol,traceLevel), .5); 
        col = drPt(col, p-vec2(1.,0.), pt, pt.y/100., mix(col,traceCol,traceLevel), .5); 
        
    	float len2 = dot(pt,pt);
    	pt = vec4(-pt.x/len2, pt.y/len2,0,0);
        
    	col = drPt(col, p, pt, pt.y/100., mix(col,traceCol,traceLevel), .5);
        len2 = dot(p,p);
        float div = 1. - 2.*p.x + len2;
        col = drPt(col, vec2((p.x-len2)/div,p.y/div), pt, pt.y/100., mix(col,traceCol,traceLevel), .5); 
        div = 1. + 2.*p.x + len2;
        col = drPt(col, vec2((p.x+len2)/div,p.y/div), pt, pt.y/100., mix(col,traceCol,traceLevel), .5); 

    }

    fragColor = col;
}