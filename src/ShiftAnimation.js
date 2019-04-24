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
	
	mat4 genPictureTranslate(int shiftID, int animID){		
		float trnslFctr = sin(progress * PI) * 10.0;

		float trnslX =  shiftID == 0 ? trnslFctr : -trnslFctr;
		float trnslY =  shiftID == 0 ? trnslFctr : -trnslFctr;
		float trnslZ =  0.0;//sinProgr * zScaleFctr;
		
		mat4 translateMat = translateMat4( vec3(animID == 1 ? trnslX : 0.0, 
															 animID == 0 ? trnslY : 0.0,
															 trnslZ) );
		
		return translateMat;
	}
	
	void main() {
		int animID = 1;
		int shiftID = evalFlipID(animID == 0 ? polygonXYZAverage.x : polygonXYZAverage.y);
		
		mat4 pictureTransl = genPictureTranslate(shiftID, animID);
		
		float sclFctr = 10.0;
		vec2 scaleRatio = imgRatio * sclFctr;
		
		gl_Position = perspective * modelView * pictureTransl * scaleMat4(vec3(scaleRatio.x, scaleRatio.y, sclFctr)) * vec4(pos.x, pos.y, pos.z, 1.0);

		f_texcoord = texcoord;
		f_trnsfrmPrgrs = progress;
	}
`;

//-----------------------------------------------------------------

var fragmentShaderSource = `#version 300 es
	precision mediump float;
	
	in vec2 f_texcoord;
	in float f_trnsfrmPrgrs;
	
	uniform sampler2D u_texture0;
	uniform sampler2D u_texture1;
	
	out vec4 outColor;
	
	void main() {
		outColor = f_trnsfrmPrgrs >= 0.5 ? texture(u_texture1, f_texcoord) : 
													  texture(u_texture0, f_texcoord);
	}
`;

class ShiftAnimation{
	
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
		this.glFunctions.setUniform1i('transformID', this._animMeta.transformID);
	}
	nextAnimation(){
		this._animMeta.transformID = (this._animMeta.transformID + 1) % this._animMeta.animationCount;
	}
};

module.exports = ShiftAnimation;

