var glMatrix = require('gl-matrix');

//-----------------------------------------------------------------

function replaceString(s, args){
  for(let i=0; i < args.length; ++i){
  	console.log('replacing: ', args[i]);
    s = s.replace('$!{' + i + '}!$', args[i]);
  }
  return s;
}

var vertexShaderSource = `		
	const float EXP_SCL_FCTR = 6.0;
	const float LOGR_SCL_FCTR = 3.0;
	
	uniform vec3 gravityCenters[$!{0}!$];
	uniform int gravityCenterCount;
	uniform mat4 rotMatHippo;
	uniform vec3 ax;
	
	int getClosestGravityCenterID(){
		vec3 gv = gravityCenters[0] - polygonXYZAverage;
		float gd = gv.x*gv.x + gv.y*gv.y + gv.z*gv.z;
		int id = 0;
		for(int i=1; i < gravityCenterCount; ++i){
			vec3 gv2 = gravityCenters[i] - polygonXYZAverage;
			float gd2 = gv2.x*gv2.x + gv2.y*gv2.y + gv2.z*gv2.z;
			if(gd2 < gd){
				id = i;
				gd = gd2;
			}
		}
		return id;
	}
	
	mat4 genFake(){
		float rad = progress * PI * 2.0 * 20.0;
		mat4 rotM = rotationAroundAxis(ax/length(ax), rad);
		
		return rotM;
	}
	
	// translate from startPos to endPos in respect to prgrs in perctage (0 -> 1)
	vec4 translateFromTo(vec3 startPos, 
								vec3 endPos,
								float prgrs){
		vec3 travelDist = endPos - startPos;
		mat4 translMat = translateMat4(travelDist * prgrs);
		return translMat * vec4(startPos, 1.0);
	}
	
	float getExponentilaProgress(float prgrs){
		return exp(prgrs * EXP_SCL_FCTR) / exp(EXP_SCL_FCTR);
	}
	float getLogarithmicProgress(float prgrs){
		float logMin = 0.1; // log(0) == - infinity!
		return (log(prgrs * LOGR_SCL_FCTR  + logMin) + abs(log(logMin))) / (log(LOGR_SCL_FCTR + logMin) + abs(log(logMin)));
	}
	
	vec4 genGravityTransform(int gravID){
		
		float minOrbitPerc = 0.2;
		float maxOrbitPerc = 0.6;
		float orbitPerc = minOrbitPerc + randoms.z * (maxOrbitPerc - minOrbitPerc);
		float nonOrbitPerc = (1.0 - orbitPerc) * 0.5;
		
		vec3 gravCent = gravityCenters[gravID];
		float gravityRad = (0.7 + randoms.y * 0.4) / (float(gravityCenterCount));
		
		vec3 polyOffs = pos - polygonXYZAverage;
		
		vec3 rndmOrbitVec0 = randoms * 2.0 - 1.0;
		vec3 rndmOrbitVecUni0 = rndmOrbitVec0 / length(rndmOrbitVec0);
		
		vec3 orbitRandomStart = rndmOrbitVecUni0 * gravityRad;
		vec3 orbitRandomStartUni = orbitRandomStart / length(orbitRandomStart);
		
		if(progress <= nonOrbitPerc){
			float relProg = progress / nonOrbitPerc;
			relProg = getExponentilaProgress(relProg);
			vec3 orbitStart = gravCent + orbitRandomStart;
			vec3 travelDist = orbitStart - polygonXYZAverage;
			return translateFromTo(pos, orbitStart + polyOffs, relProg);
		}else{			
			vec3 rndmOrbitVec1 = (vec3(randoms.z, randoms.x, randoms.y) * 2.0 - 1.0) * gravityRad;
			vec3 rndmOrbitVecUni1 = rndmOrbitVec1 / length(rndmOrbitVec1);
			
			vec3 orthoVec;
			if(polygonXYZAverage.x < 0.0){
				orthoVec = cross(rndmOrbitVecUni0, rndmOrbitVecUni1);
			}else{
				orthoVec = cross(rndmOrbitVecUni1, rndmOrbitVecUni0);
			}
			vec3 orthoVecUni = orthoVec / length(orthoVec);
			
			float rotations = 0.1 + randoms.z * 2.5;
			float relProg = (progress - nonOrbitPerc) / orbitPerc;
			float rad = min(relProg, 1.0) * rotations * PI * 2.0;
			
			mat4 GRM = rotationAroundAxis(rndmOrbitVecUni1, rad);
			
			mat4 translToCenter = translateMat4(gravCent);
			vec4 orbitEndPos = translToCenter * GRM * vec4(orbitRandomStart + polyOffs, 1.0);
			
			if(progress >= 1.0 - nonOrbitPerc){
				float relProg = (progress - (orbitPerc + nonOrbitPerc)) / nonOrbitPerc;
				relProg = getLogarithmicProgress(relProg);
				vec3 orbitEndPosVec3 = vec3(orbitEndPos);
				return translateFromTo(orbitEndPosVec3 + polyOffs, pos, relProg);
			}else{
				return orbitEndPos;
			}
		}
	}
	
	void main() {
		int centID = getClosestGravityCenterID();
		
		vec4 pos4 = genGravityTransform(centID);
		
		float sclFctr = 10.0;
		vec2 scaleRatio = imgRatio * sclFctr;
		mat4 scaleImage = scaleMat4(vec3(scaleRatio.x, scaleRatio.y, sclFctr));
		
		float maxYRotCirclFrct = 0.1;
		float rotYprog = progress;//sin(progress * TAU) * maxYRotCirclFrct;
		mat4 modlViewRotY = rotateY(rotYprog * PI * 2.0);
		
		float maxXRotCirclFrct = 0.12;
		float rotXprog = sin(progress * PI) * maxXRotCirclFrct;
		mat4 modlViewRotX = rotateX(rotXprog * PI * 2.0);
		
		gl_Position = perspective * modelView * modlViewRotX * modlViewRotY * scaleImage * pos4;

		f_texcoord = texcoord;
		f_trnsfrmPrgrs = progress;
	}
`;

//-----------------------------------------------------------------

var fragmentShaderSource = ``;

function getQuaternion(ax, rad){
	let radHalf = rad * 0.5;
	let rhs = Math.sin(radHalf);
	let rhc = Math.cos(radHalf);
	let q = [rhc, ax[0] * rhs, ax[1] * rhs, ax[2] * rhs];
	return q;
}
function rotationAroundAxis(ax, rad){
	let q = getQuaternion(ax, rad);
	let m = glMatrix.mat4.create();
	let qw = q[0];
	let qx = q[1];
	let qy = q[2];
	let qz = q[3];
	let qxx = qx*qx;
	let qyy = qy*qy;
	let qzz = qz*qz;
	m[0 * 4 + 0] = 1.0 - 2.0 * qyy - 2.0 * qzz;
	m[1 * 4 + 0] = 2.0 * qx * qy - 2.0 * qz * qw;
	m[2 * 4 + 0] = 2.0 * qx * qz + 2.0 * qy * qw;
	m[0 * 4 + 1] = 2.0 * qx * qy + 2.0 * qz * qw;
	m[1 * 4 + 1] = 1.0 - 2.0 * qxx - 2.0 * qzz;
	m[2 * 4 + 1] = 2.0 * qy * qz - 2.0 * qx * qw;
	m[0 * 4 + 2] = 2.0 * qx * qz - 2.0 * qy * qw;
	m[1 * 4 + 2] = 2.0 * qy * qz + 2.0 * qx * qw;
	m[2 * 4 + 2] = 1.0 - 2.0 * qxx - 2.0 * qyy;
	return m;
}

class GravityAnimation{
	constructor(glFunctions){		
		this._waveMeta = {
			gravityCentersCount: 3,
		};
		
		this.vertexShaderSource = replaceString(vertexShaderSource, [this._waveMeta.gravityCentersCount,]);
		this.fragmentShaderSource = fragmentShaderSource;
		
		this.glFunctions = glFunctions;
	}
	
	setGL(_gl){
		this.gl = _gl;
	}
	
	genGravityCenters(){
		let gravCentrs = [];
/*		gravCentrs = [-0.5, 0, 0,
							0.5, 0, 0];*/
		for(let i=0; i < Math.ceil(Math.random() * this._waveMeta.gravityCentersCount); ++i){
			let cent = [(Math.random() - 0.5) * 1.5,
							(Math.random() - 0.5) * 1.5,
							(Math.random() - 0.5) * 1.5];
			gravCentrs.push( ...cent )
		}
		return gravCentrs;
	}
	
	initBufferData(){
		let gravCenters = this.genGravityCenters();
//		console.log('gravCenters: ', gravCenters);
		this.glFunctions.setUniformVector3fv('gravityCenters', gravCenters);
		this.glFunctions.setUniform1i('gravityCenterCount', this._waveMeta.gravityCentersCount);
		
		this.prog = 0;
		
		this.ax = [0,20,0];
//		glMatrix.vec3.normalize(this.ax, this.ax);
		console.log('ax: ', this.ax);
		let rad = 0.0;
		
		let rotm0 = rotationAroundAxis(this.ax, rad);
		this.glFunctions.setUniformMatrix4fv('rotMatHippo', rotm0);
		this.glFunctions.setUniformVector3fv('ax', this.ax);
	}
	updateBufferData(){
		let rad = this.prog;
		this.prog += 0.05;
		
		let rotm0 = rotationAroundAxis(this.ax, rad);
		this.glFunctions.setUniformMatrix4fv('rotMatHippo', rotm0);
	}
	
	nextAnimation(){
		let gravCenters = this.genGravityCenters();
		this.glFunctions.setUniformVector3fv('gravityCenters', gravCenters);
	}
};

module.exports = GravityAnimation;

