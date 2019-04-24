var glMatrix = require('gl-matrix');
const StaticFunctions = require('./StaticFunctions');

//-----------------------------------------------------------------

var vertexShaderSource = `		
	uniform vec3 tileCenters[$!{TileCentersCount}!$];
	const int tileCentCount = $!{TileCentersCount}!$;
	
	float interpolX(float x){
		return (x + 1.0) * 0.5;
	}
	
	float getSqrdDist(vec3 v0, vec3 v1){
		float dx = v0.x - v1.x;
		float dy = v0.y - v1.y;
		float dz = v0.z - v1.z;
		return dx * dx + dy * dy + dz * dz;
	}
	
	vec2 getTileCenter(){
		float closestTileID = 0.0;
		float tileDist = getSqrdDist(polygonXYZAverage, tileCenters[0]);
		for(int i=1; i < $!{TileCentersCount}!$; ++i){
			float curDist = getSqrdDist(polygonXYZAverage, tileCenters[i]);
			if(curDist < tileDist){
				tileDist = curDist;
				closestTileID = float(i);
			}
		}
		tileDist += randoms.x;
		return vec2(closestTileID, tileDist);
	}
	
	mat4 genScaleMat(float prog){		
		float sclFctr =  1.0 - sin(prog * PI) * 1.0;

		mat4 sclM = scaleMat4( vec3(sclFctr, sclFctr, 1.0) );
		return sclM;
	}
	
	float evalRelProgress(int tileCentID){
		float tileCentIDf = float(tileCentID);
		float tileCentCountf = float(tileCentCount);
		
		float progOffs = 1.0 / (tileCentCountf * 2.0);
		float progDur = 1.0 / 2.0;
		float progStart = tileCentIDf * progOffs;
		float progEnd = progStart + progDur;
		
		float relProg = (progress - progStart) / progDur;
		relProg = min( max(relProg, 0.0) , 1.0);
		return relProg;
	}

	vec4 evalPos(int tileCentID, float relProg){
		float tileCentIDf = float(tileCentID);
		float tileCentCountf = float(tileCentCount);
		
		vec3 tileCent = tileCenters[ tileCentID ];
		
		float progOffs = 1.0 / (tileCentCountf * 2.0);
		float progDur = 1.0 / 2.0;
		float progStart = tileCentIDf * progOffs;
		float progEnd = progStart + progDur;
		
		if(relProg <= 0.0 || relProg >= 1.0){
			return vec4(pos, 1.0);
		}else{
			mat4 sclM = genScaleMat(relProg);
			mat4 trnslFromTileCent = translateMat4( -tileCent );
			mat4 trnslToTileCent   = translateMat4(  tileCent );
			vec4 pos4 = vec4(pos, 1.0);
			
			return trnslToTileCent * sclM * trnslFromTileCent * pos4;
		}
	}
	
	void main() {
		vec2 tileCentAndDist = getTileCenter();
		
		int tileCentID = int(tileCentAndDist[0]);
		float dist = tileCentAndDist[1];
		
		float relProg = evalRelProgress(tileCentID);
		
		vec4 pos4 = evalPos(tileCentID, relProg);
		
		float sclFctr = 10.0;
		vec2 scaleRatio = imgRatio * sclFctr;
		mat4 scaleImage = scaleMat4(vec3(scaleRatio.x, scaleRatio.y, sclFctr));
		
		gl_Position = perspective * modelView * scaleImage * pos4;//vec4(pos, 1.0);

		f_texcoord = texcoord;
		f_trnsfrmPrgrs = relProg;
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
		
		vec4 txt;
		if(f_trnsfrmPrgrs >= 0.5){
			txt = txt1;
		}else{
			txt = txt0;
		}

		outColor = txt;
	}
`;

class DelayedTileAnimation{
	
	constructor(glFunctions){
		this._animMeta = {
			tileCentersPerRow: 8,
			tileAnimID: 0,
			tileAnimIDCount: 3
		};
		this.genTileCenters();
		
		this.vertexShaderSource = StaticFunctions.replaceString(vertexShaderSource, 
																				  [Math.pow(this._animMeta.tileCentersPerRow, 2),],
																				  ['TileCentersCount',]);
		this.fragmentShaderSource = fragmentShaderSource;
		
		this.glFunctions = glFunctions;
	}
	
	genTileCenters(){
		this.tileCenters = [];
		let tileAnimID = this._animMeta.tileAnimID;
		let tileCentersPerRow = this._animMeta.tileCentersPerRow;
		let tileCentersCount = tileCentersPerRow * tileCentersPerRow;
		
		let strt = -1;
		let offs = 2 / this._animMeta.tileCentersPerRow;
		
		let genPolygons = (r,c)=>{
			this.tileCenters.push( [ strt + (c + 0.5) * offs,
									  		 strt + (r + 0.5) * offs,
									  		 0 ]
								 		);
		};
		
		let randomIDs;
		if(tileAnimID === 2){
			randomIDs = [];
			for(let i=0; i < tileCentersCount; ++i){
				randomIDs.push(i);
			}
			randomIDs = StaticFunctions.shuffle(randomIDs);
		}
		
		for(let r=0; r < tileCentersPerRow; ++r){
			for(let c=0; c < tileCentersPerRow; ++c){
				if(tileAnimID === 0){
					genPolygons(r,c);
				}else if (tileAnimID == 1){
					genPolygons(c,r);
				}else{
					let id = randomIDs[r * tileCentersPerRow + c];
					let r_rnd = Math.floor(id / tileCentersPerRow);
					let c_rnd = Math.floor(id % tileCentersPerRow);
					genPolygons(r_rnd, c_rnd);
				}
			}
		}
	}
	
	setGL(_gl){
		this.gl = _gl;
	}
	
	genAndSetTileCenters(){
		this.genTileCenters();
		
		let tileCentersPerRow = this._animMeta.tileCentersPerRow;
		for(let i=0; i < tileCentersPerRow * tileCentersPerRow; ++i){
			this.glFunctions.setUniformVector3fv('tileCenters[' + i + ']', this.tileCenters[i]);
		}
	}
	
	initBufferData(){
		this.genAndSetTileCenters();
	}
	updateBufferData(){
	}
	nextAnimation(){
		this._animMeta.tileAnimID = ++this._animMeta.tileAnimID % this._animMeta.tileAnimIDCount;
		
		this.genAndSetTileCenters();
	}
};

module.exports = DelayedTileAnimation;

