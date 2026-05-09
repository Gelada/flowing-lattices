// Buffer for trailing dots

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = coords(fragCoord, iResolution, 2., vec2(iResolution.x * 0.5, 0.0));
	vec2 uv = fragCoord.xy / iResolution.xy;
    
    vec4 col = vec4(blur(hpTrails,uv,5.*iResolution.xy));
    if(showTrails) {
    	col = mix(col,vec4(backCol.xyz,0),iResolution.y/640.*trailFalloff/length(backCol-col));
    } else {
        col = vec4(backCol.xyz,0);
    }
    //col = backCol;
    
    if(showDots) { 
    	vec2 b1 = uLattice.xy;
    	vec2 b2 = uLattice.zw;

        vec4 pt = hpPt(b1, b2);

        col = drPt(col, p, pt, pt.y/25., dotCol, 0.15); 
        col = drPt(col, p+vec2(1.,0.), pt, pt.y/25., dotCol, 0.15); 
        col = drPt(col, p-vec2(1.,0.), pt, pt.y/25., dotCol, 0.15); 
               
        float len2 = dot(pt,pt);
    	pt = vec4(-pt.x/len2, pt.y/len2,0,0);
        
        col = drPt(col, p, pt, pt.y/25., dotCol, 0.15); 
        len2 = dot(p,p);
        float div = 1. - 2.*p.x + len2;
        col = drPt(col, vec2((p.x-len2)/div,p.y/div), pt, pt.y/25., dotCol, 0.15); 
        div = 1. + 2.*p.x + len2;
        col = drPt(col, vec2((p.x+len2)/div,p.y/div), pt, pt.y/25., dotCol, 0.15); 
    }
    
    fragColor = col;
}