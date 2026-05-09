// Buffer for trailing dots

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{    
    vec2 p = coords(fragCoord, iResolution, uScale, iResolution.xy * 0.5);
    
	vec2 uv = fragCoord / iResolution.xy;
    
    vec4 col = vec4(blur(dotTrails,uv,5.*iResolution.xy));
    if(showTrails) {
    	col = mix(col,vec4(backCol.xyz,0),iResolution.y/640.*trailFalloff/length(backCol-col));
    } else {
        col = vec4(backCol.xyz,0);
    }
    
    mat2 pLattice = mat2(uLattice);

    if(showDots) 
    { 
        col = drGrid(col, p, pLattice, 0.2, dotCol, 0.15); 
    }
    
    if(showBasis)
    {    
    	col = drPt(col, p, uLattice, .4, basisCol, .75);
    	col = drPt(col, p, vec4(uLattice.zw,0,0), .4, basisCol, .75);
    }

    fragColor = col;
}