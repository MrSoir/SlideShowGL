var glMatrix = require('gl-matrix');

//-----------------------------------------------------------------

var vertexShaderSource = `		
	uniform int transformID;
	
	float interpolX(float x){
		return (x + 1.0) * 0.5;
	}
	
	int getShiftCategory(float x, float rng){
		float v = floor(x / rng);
		float m = mod(v, 2.0);
		return int(m) == 0 ? 0 : 1;
	}

	int evalFlipID(float v){
		float rng = 0.2;
		
		float intplV = interpolX(v);
		
		int flipID = getShiftCategory(intplV, rng);
		return flipID;
	}
	
	mat4 genScaleMat(){		
		float sclFctr =  1.0 - sin(progress * PI) * 0.5;

		mat4 sclM = scaleMat4( vec3(sclFctr, sclFctr, 1.0) );
		return sclM;
	}
	
	void main() {		
		mat4 scaleMat = genScaleMat();
		mat4 rotZ = rotateZ( progress * PI * 2.0 );
		
		vec3 centTrnsl = pos - polygonXYZAverage;
		
		vec4 cntrdPos = vec4(pos - polygonXYZAverage, 1.0);
		vec4 cntrdPosScld = scaleMat * cntrdPos;
		cntrdPosScld = rotZ * cntrdPosScld;
		vec4 posScld = vec4(cntrdPosScld.xyz + polygonXYZAverage, 1.0);
		
		vec4 pos4 = posScld;
		
		float sclFctr = 10.0;
		vec2 scaleRatio = imgRatio * sclFctr;
		mat4 scaleImage = scaleMat4(vec3(scaleRatio.x, scaleRatio.y, sclFctr));
		
		gl_Position = perspective * modelView * scaleImage * pos4;//vec4(pos, 1.0);

		f_texcoord = texcoord;
		f_trnsfrmPrgrs = progress;
	}
`;

//-----------------------------------------------------------------

var fragmentShaderSource = ``;

class ScaleAnimation{
	
	constructor(glFunctions){
		this.vertexShaderSource = vertexShaderSource;
		this.fragmentShaderSource = fragmentShaderSource;
		
		this._animMeta = {
			transformID: 2,
			animationCount: 9,
		};
		
		this.glFunctions = glFunctions;
	}
	
	setGL(_gl){
		this.gl = _gl;
	}
	
	initBufferData(){
		this.glFunctions.setUniform1i('transformID', this._animMeta.transformID);
	}
	updateBufferData(){
	}
	nextAnimation(){
		this._animMeta.transformID = (this._animMeta.transformID + 1) % this._animMeta.animationCount;
		this.glFunctions.setUniform1i('transformID', this._animMeta.transformID);
	}
};

module.exports = ScaleAnimation;

