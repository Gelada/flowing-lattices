void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    
    vec4 col = vec4(texture(gridTrace,uv).xyz,1);
    
    vec4 traced = vec4(texture(dotTrails,uv));
    
    col = vec4(mix(col, traced, traced.w).xyz,1.);

    // Output to screen
    fragColor = col;
}
