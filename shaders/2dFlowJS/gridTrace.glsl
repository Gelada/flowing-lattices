// Buffer for Background and complete path record

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{   
    vec2 p = coords(fragCoord, iResolution, uScale, iResolution.xy * 0.5);
	vec2 uv = fragCoord / iResolution.xy;

    vec4 col = mix(backCol,vec4(texture(gridTrace,uv).xyz,1),backFade);

    col = drGrid(col, p, mat2(uLattice), 0.075, mix(col,traceCol,traceLevel), 2.);
    
    if(iFrame == 0 || uv.x > 1. || uv.y <0. || uv.y > 1. || uv.y < 0. || iMouse.z > 0.) 
    { col = backCol; }
    
    fragColor = col;
}