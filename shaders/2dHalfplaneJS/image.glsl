void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec4 col = vec4(.6,.6,.6,1.);
    
    vec2 p = coords(fragCoord, iResolution, 2., vec2(iResolution.x * 0.5, 0.0));

    bool inCell;
    switch(uCell) {
        case 0:  inCell = uCellTest(p);      break;
        case 1:  inCell = seriesCellTest(p); break;
        default: inCell = true;              break;
    }

    	for(int i=0; i<10; i++)
    	{    
    		p.x = p.x - round(p.x);
    		float len2 = dot(p,p);
    
    		if(len2 < 1.) { 
    	    	p = vec2(-p.x/len2, p.y/len2);
    		}
    	}
    	float len2 = dot(p,p);
    
    	if(p.y > 2.)
    	{
    		p = vec2(-p.x/len2, p.y/len2);
    	}

    if(inCell)
    {
        vec2 uv = iCoords(p, iResolution, 2., vec2(iResolution.x * 0.5, 0.0)) / iResolution.xy;
    
        if(uv.y > .998) { uv.y = .9995;}
    
        col = vec4(texture(hpBackground,uv).xyz,1);

        vec4 traced = vec4(texture(pathBackground,uv));
        
        col = vec4(mix(col, traced, 1.-traced.x).xyz,1.);
    
        traced = vec4(texture(hpTrails,uv));
    
        if(traced.w < .001) { traced.w = 0.; }
    
        col = vec4(mix(col, traced, traced.w).xyz,1.);
    }

    // Output to screen
    fragColor = col;
}
