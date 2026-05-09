#include "../shared/2d_utils.glsl"
#include "../shared/hp_utils.glsl"
#include "../shared/coord_utils.glsl"

bool showTrails = false;
float trailFalloff = 1.;
bool showDots = true;
bool showBasis = false;
bool wholePlane = true;
float traceLevel = 0.3;
float backFadeHp = .99995;
float backFade = .999;
float lineThick = 1./15.;

vec4 dotCol   = vec4(.8, .05, .04, 1.);
vec4 backCol  = vec4(1., 1., 1., 0);
vec4 traceCol = vec4(0., 0., 0., 1.);
vec4 basisCol = vec4(.651, .669, .95, 1.);
vec4 edgeCol  = vec4(.651, .669, .95, 1.);

