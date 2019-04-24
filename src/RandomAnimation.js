var glMatrix = require('gl-matrix');

//-----------------------------------------------------------------

var vertexShaderSource = `		
	uniform int transformID;
	
	float sigmoid(float prntgProgress){
		// prntgProgress -> progress in percentage
		// rng = 5.0 -> in range -5 to 5, the sigmoid-function 
		//       approaches from (almost) 0 to (almost) 1
		float rng = 10.0;
		float interpolX = prntgProgress * (2.0 * rng) - rng;
		return 0.5 * (1.0 + tanh(interpolX * 0.5));
	}

	float translateFromLeftToRight(vec3 polygonCenter){
		float x = polygonCenter.x;
		return (x + 1.0) * 0.5;
	}
	float translateFromRightToLeft(vec3 polygonCenter){
		return 1.0 - translateFromLeftToRight(polygonCenter);
	}
	float translateFromCenter(vec3 polygonCenter){
		float x = polygonCenter.x;
		float y = polygonCenter.y;
		float sqrDistFromCent = x*x + y*y;
		float maxDist = 2.0; // 1*1 + 1+1
		return sqrDistFromCent / maxDist;
	}
	float translateToCenter(vec3 polygonCenter){
		return 1.0 - translateFromCenter(polygonCenter);
	}
	float translateFromBottomToTop(vec3 polygonCenter){
		return translateFromLeftToRight(vec3(polygonCenter.y, polygonCenter.x, polygonCenter.z));
	}
	float translateFromTopToBottom(vec3 polygonCenter){
		return 1.0 - translateFromBottomToTop(polygonCenter);
	}
	float translateFromBottomLeftToTopRight(vec3 polygonCenter){
		float x = polygonCenter.x;
		float y = polygonCenter.y;
		float xsign = x < 0.0 ? -1.0 : 1.0;
		float ysign = y < 0.0 ? -1.0 : 1.0;
		float sqrDistFromCent = (x*x * xsign + y*y * ysign) + 2.0;
		float maxDist = 4.0; // 1*1 + 1+1
		return sqrDistFromCent / maxDist;
	}
	float translateFromTopRightToBottomLeft(vec3 polygonCenter){
		return 1.0 - translateFromBottomLeftToTopRight(polygonCenter);
	}
	float translateFromTopLeftToBottomRight(vec3 polygonCenter){
		float x = polygonCenter.x;
		float y = polygonCenter.y;
		float xsign = x < 0.0 ? -1.0 : 1.0;
		float ysign = y < 0.0 ? -1.0 : 1.0;
		float sqrDistFromCent = (x*x * xsign + y*y * ysign * -1.0) + 2.0;
		float maxDist = 4.0; // 1*1 + 1+1
		return sqrDistFromCent / maxDist;
	}
	float translateFromBottomRightToTopLeft(vec3 polygonCenter){
		return 1.0 - translateFromTopLeftToBottomRight(polygonCenter);
	}
	float getPercX(){
		return translateFromLeftToRight(polygonXYZAverage);
	}
	float evalTransformationProgress(){
		float sig_rng = 0.25;
		float x_perc_rng = 1.0 - 2.0 * sig_rng;
		float s0 = sig_rng + progress * (1.0 - sig_rng);
		float s1 = s0 - sig_rng;
		
		float x = polygonXYZAverage.x;
		
		float percX = getPercX();
		
		float intpolX = sig_rng + percX * x_perc_rng;
		
		if(intpolX >= s0){
			return 0.0;
		}else if(intpolX <= s1){
			return 1.0;
		}
		else{
			float sigX = (s0 - intpolX) / (s0 - s1);
			float sig = sigmoid(sigX);
			return sig;
		}
	}
	
	vec3 genPictureTranslate(float trnsfrmPrgrs){
		float y = polygonXYZAverage.y;
		float yOffs = abs(y) / 1.0;
		float ySide = y >= 0.0 ? 1.0 : -1.0;
		
		float rndx = randoms.x - 0.5;
		float rndy = randoms.y - 0.5;
		float rndz = randoms.x - 0.5;
		
		float xScaleFctr = randoms.x * trnsfrmPrgrs;
		float yScaleFctr = randoms.y * trnsfrmPrgrs;
		float zScaleFctr = randoms.z * trnsfrmPrgrs;
		
		float expFctr = 40.0;
		float expFrtn = exp(randoms.x * expFctr) / exp(expFctr);
		
		float trnslX = xScaleFctr * sin(trnsfrmPrgrs * PI) * yOffs * (randoms.x - 0.5) * expFrtn;
		float trnslY = yScaleFctr * sin(trnsfrmPrgrs * PI) * yOffs * ySide * expFrtn;
		float trnslZ = zScaleFctr * sin(trnsfrmPrgrs * PI) * yOffs * (randoms.z - 0.5);
		
		return vec3(trnslX, trnslY, trnslZ);
	}
	
	mat4 genPictureScale(float trnsfrmPrgrs){		
		float sclFctr = 1.0 + sin(trnsfrmPrgrs * PI) * 3.0;
		float sclX = sclFctr;
		float sclY = sclFctr;
		float sclZ = 1.0;
		
		mat4 scaleMat = scaleMat4( vec3(sclX, sclY, sclZ) );
		return scaleMat;
	}
	
	void main() {
		float trnsfrmPrgrs = evalTransformationProgress();
		
		vec4 pos4;
		if(trnsfrmPrgrs == 0.0){
			pos4 = vec4(pos, 1.0);
		}	else if(trnsfrmPrgrs == 1.0){
			pos4 = vec4(pos, 1.0);
		}else{
			vec3 cntrdPos = pos - polygonXYZAverage;
			
			vec4 cntrdPos4 = vec4(cntrdPos, 1.0);
			
			mat4 rotMatX = rotateX(trnsfrmPrgrs * PI * 2.0);
			mat4 rotMatY = rotateY(trnsfrmPrgrs * PI * 2.0);
			mat4 rotMatZ = rotateZ(trnsfrmPrgrs * PI * 2.0);
			vec4 cntrdPosRot = rotMatY * rotMatZ * cntrdPos4;
			
			mat4 sclMat = genPictureScale(trnsfrmPrgrs);
			vec4 cntrdPosScld = sclMat * cntrdPosRot;
			
			vec3 cntrdPosTrnsl = genPictureTranslate(trnsfrmPrgrs);

			pos4 = vec4(cntrdPosScld.xyz + cntrdPosTrnsl + polygonXYZAverage, 1.0);
		}
		
		float sclFctr = 10.0;
		vec2 scaleRatio = imgRatio * sclFctr;
		
		mat4 imgScl = scaleMat4(vec3(scaleRatio.x, scaleRatio.y, sclFctr));
		
		gl_Position = perspective * modelView * imgScl * pos4;
		
		f_texcoord = texcoord;
		f_trnsfrmPrgrs = trnsfrmPrgrs;
	}
`;

//-----------------------------------------------------------------

var fragmentShaderSource = ``;

class RandomAnimation{
	
	constructor(glFunctions){
		this.vertexShaderSource = vertexShaderSource;
		this.fragmentShaderSource = fragmentShaderSource;
		
		this._waveMeta = {
			transformID: 2,
			animationCount: 9,
		};
		
		this.glFunctions = glFunctions;
	}
	
	setGL(_gl){
		this.gl = _gl;
	}
	
	initBufferData(){
		this.glFunctions.setUniform1i('transformID', this._waveMeta.transformID);
	}
	updateBufferData(){
		this.glFunctions.setUniform1i('transformID', this._waveMeta.transformID);
	}
	
/*	setTransformID(id){
		this._waveMeta.transformID = id;
	}*/
	nextAnimation(){
		this._waveMeta.transformID = (this._waveMeta.transformID + 1) % this._waveMeta.animationCount;
	}
};

module.exports = RandomAnimation;

