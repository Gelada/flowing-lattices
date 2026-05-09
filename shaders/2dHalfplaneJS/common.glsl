#include "../shared/2d_utils.glsl"
#include "../shared/hp_utils.glsl"
#include "../shared/coord_utils.glsl"

bool showTrails = false;
float trailFalloff = 0.5; // Length of fading trails, 1 gives no tails.
bool showDots = true;
float traceLevel = .3;
float lineThick = 1./20.;
float backFadeHp = .99999; 


vec4 dotCol = vec4(.8,.05,.04,1.);
vec4 backCol = vec4(1.,1.,1.,1.);
vec4 traceCol = vec4(0.,0.,0.,1.);
vec4 edgeCol = vec4(.651,.669,.95,1.);

