// Buffer for Background

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    
    vec2 p = coords(fragCoord, iResolution, 2., vec2(iResolution.x * 0.5, 0.0));
    
	vec2 uv = fragCoord / iResolution.xy;
    
    vec4 col;

        col = backCol; 
        float len = length(p);
                
        float d = abs(len - 1.);
        if( abs(p.x) < .5 && d < p.y*lineThick) { col = mix(edgeCol,col,pow(d/(lineThick*p.y),3.)); }

                
        d = abs(p.x - .5);        
        if(len>1. && d < p.y*lineThick) { col = mix(edgeCol,col,pow(d/(lineThick*p.y),3.)); }
        d = abs(p.x + .5);
        if(len>1. && d < p.y*lineThick) { col = mix(edgeCol,col,pow(d/(lineThick*p.y),3.)); }
        
        p = vec2(-p.x/(len*len),p.y/(len*len));
        len =1./len;
                
        d = abs(p.x - .5);        
        if(len>1. && d < p.y*lineThick) { col = mix(edgeCol,col,pow(d/(lineThick*p.y),3.)); }
        d = abs(p.x + .5);
        if(len>1. && d < p.y*lineThick) { col = mix(edgeCol,col,pow(d/(lineThick*p.y),3.)); }

    fragColor = col;
}