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
		if(transformID == 0){
			return translateFromLeftToRight(polygonXYZAverage);
		}else if(transformID == 1){
			return translateFromRightToLeft(polygonXYZAverage);
		}else if(transformID == 2){
			return translateFromCenter(polygonXYZAverage);
		}else if(transformID == 3){
			return translateToCenter(polygonXYZAverage);
		}else if(transformID == 4){
			return translateFromTopToBottom(polygonXYZAverage);
		}else if(transformID == 5){
			return translateFromBottomToTop(polygonXYZAverage);
		}else if(transformID == 6){
			return translateFromBottomLeftToTopRight(polygonXYZAverage);
		}else if(transformID == 7){
			return translateFromTopRightToBottomLeft(polygonXYZAverage);
		}else if(transformID == 8){
			return translateFromTopLeftToBottomRight(polygonXYZAverage);
		}else if(transformID == 9){
			return translateFromBottomRightToTopLeft(polygonXYZAverage);
		}
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
	
	mat4 genPictureTranslate(float trnsfrmPrgrs){		
		float y = polygonXYZAverage.y;
		float yOffs = (y + 1.0) * 0.5;
		
		float xScaleFctr = 1.0;
		float yScaleFctr = 2.0;
		float zScaleFctr = 10.0;
		
		bool inRange = trnsfrmPrgrs > 0.0;
		float randX = inRange ? (randoms[0] - 0.5) : 0.0;
		float randY = inRange ? (randoms[1] - 0.5) : 0.0;
		
		float sinProgr = sin(trnsfrmPrgrs * PI);
		randX *= sinProgr;
		randY *= sinProgr;
		
		float yTranslScale = (yOffs - 0.5) * 2.0;
		
		float trnslX =  randX * xScaleFctr;
		float trnslY =  (sinProgr * yTranslScale) * yScaleFctr;// * randY;
		float trnslZ =  0.0;//sinProgr * zScaleFctr;
		
		mat4 translateMat = translateMat4( vec3(trnslX, trnslY, trnslZ) );
		
		return translateMat;
	}
	
	mat4 genPictureScale(float trnsfrmPrgrs){
		float y = polygonXYZAverage.y;
		float yOffs = (y + 1.0) * 0.5;
		
		float sclFctr = 1.0 - sin(trnsfrmPrgrs * PI) * 0.1;//abs((trnsfrmPrgrs - 0.5) * 2.0);
		float sclX = sclFctr;
		float sclY = sclFctr;
		float sclZ = sclFctr;
		
		mat4 scaleMat = scaleMat4( vec3(sclX, sclY, sclZ) );
		return scaleMat;
	}
	
	void main() {
		float trnsfrmPrgrs = evalTransformationProgress();
		
		mat4 pictureTransl = genPictureTranslate(trnsfrmPrgrs);
		mat4 picturesScale = genPictureScale(trnsfrmPrgrs);
		
		float sclFctr = 10.0;
		vec2 scaleRatio = imgRatio * sclFctr;
		
		gl_Position = perspective * modelView * pictureTransl * scaleMat4(vec3(scaleRatio.x, scaleRatio.y, sclFctr)) * vec4(pos.x, pos.y, pos.z, 1.0);

		f_texcoord = texcoord;
		f_trnsfrmPrgrs = trnsfrmPrgrs;
	}
`;

//-----------------------------------------------------------------

var fragmentShaderSource = ``;

class WaveAnimation{
	
	constructor(glFunctions){
		this.vertexShaderSource = vertexShaderSource;
		this.fragmentShaderSource = fragmentShaderSource;
		
		this._waveMeta = {
			transformID: 2,
			animationCount: 10,
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
	}
	nextAnimation(){
		this._waveMeta.transformID = Math.floor( (this._waveMeta.transformID + 1) % this._waveMeta.animationCount );
		console.log('waveID: ', this._waveMeta.transformID);
		this.glFunctions.setUniform1i('transformID', this._waveMeta.transformID);
	}
};

module.exports = WaveAnimation;

