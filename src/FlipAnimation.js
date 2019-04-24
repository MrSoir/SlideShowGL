var glMatrix = require('gl-matrix');

//-----------------------------------------------------------------

var vertexShaderSource = `		
	uniform int transformID;
	
	float interpolX(float x){
		return (x + 1.0) * 0.5;
	}
	
	mat4 rotateAroundY(){
		float rad = progress * PI;
		return rotateY(rad);
	}
	mat4 rotateAroundYRev(){
		float rad = -progress * PI;
		return rotateY(rad);
	}
	mat4 rotateAroundX(){
		float rad = progress * PI;
		return rotateX(rad);
	}
	mat4 rotateAroundXRev(){
		float rad = -progress * PI;
		return rotateX(rad);
	}
	mat4 genPictureRotate(int rotID){
		if(rotID == 0){
			return rotateAroundY();
		}else if(rotID == 1){
			return rotateAroundYRev();
		}else if(rotID == 2){
			return rotateAroundX();
		}else{
			return rotateAroundXRev();
		}
	}
	
	void main() {
		int rotID = transformID;
		
		mat4 pictureRotation = genPictureRotate(rotID);
		
		float sclFctr = 10.0;
		vec2 scaleRatio = imgRatio * sclFctr;
		
		gl_Position = perspective * modelView * pictureRotation * scaleMat4(vec3(scaleRatio.x, scaleRatio.y, sclFctr)) * vec4(pos.x, pos.y, pos.z, 1.0);

		vec2 txt;
		if(rotID == 0 || rotID == 1){
			txt = progress >= 0.5 ? vec2(1.0-texcoord.x, texcoord.y) : texcoord;
		}else{
			txt = progress >= 0.5 ? vec2(texcoord.x, 1.0-texcoord.y) : texcoord;
		}
		f_texcoord = txt;
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
		vec4 txt0 = texture(u_texture0, f_texcoord);
		vec4 txt1 = texture(u_texture1, f_texcoord);

		outColor = f_trnsfrmPrgrs >= 0.5 ? txt1 : txt0;
	}
`;

class FlipAnimation{
	
	constructor(glFunctions){
		this.vertexShaderSource = vertexShaderSource;
		this.fragmentShaderSource = fragmentShaderSource;
		
		this._animMeta = {
			transformID: 0,
			animationCount: 4,
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

module.exports = FlipAnimation;

