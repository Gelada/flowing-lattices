#include "../shared/2d_utils.glsl"
#include "../shared/coord_utils.glsl"

bool showTrails = false;
float trailFalloff = 1.; // Length of fading trails, 1 gives no tails.
bool showDots = true;
bool showBasis = false;
bool secondLattice = false;
float traceLevel = 0.3;
float backFade = .999;
bool chBasis = true;

vec4 dotCol = vec4(.8,.05,.04,1.);
vec4 dotCol2 = vec4(.05,.04,.55,1.);
vec4 backCol = vec4(1.,1.,1.,0);
vec4 traceCol = vec4(0.,0.,0.,1.);
vec4 basisCol = vec4(.651,.669,.95,1.);

float sc = 14.;
