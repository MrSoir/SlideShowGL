let INIT_SPLIT_DEPTH = 13;

var TriangleSplitter = {
	squareDist: function(v0, v1){
		let dx = v0[0] - v1[0];
		let dy = v0[1] - v1[1];
	   return dx * dx  +  dy * dy;
	},
	
	getTriangleSplitPoints: function(v0, v1, v2){
		let d0 = this.squareDist(v0, v1);
	   let d1 = this.squareDist(v1, v2);
	   let d2 = this.squareDist(v2, v0);
	
	   let spltV0;
	   let spltV1;
	   let centrV;
	
		if(d0 > d1 && d0 > d2){
			spltV0 = v0;
	      spltV1 = v1;
	      centrV = v2;
	   }else if(d1 > d0 && d1 > d2){
	      spltV0 = v1;
	      spltV1 = v2;
	      centrV = v0;
	   }else{ // d2 is max:
	   	spltV0 = v2;
	   	spltV1 = v0;
	   	centrV = v1;
	   }
	   return [spltV0, spltV1, centrV];
	},
	
	// splitTriangleRec: recursive split -> problem: with splitDepth, it creates 2**14 triangles -> and reaches memory leak / stack overflow
	splitTriangleRec: function(vs, splitDepth = INIT_SPLIT_DEPTH, curSplitDepth=0, retArr = undefined){
	    if(curSplitDepth > splitDepth){
	        return vs;
	    }
	    
	    let v0, v1, v2;
	    [v0, v1, v2] = vs;
	
	    let spltV0, spltV1, centrV;
    	 [spltV0, spltV1, centrV] = this.getTriangleSplitPoints(v0, v1, v2);
	    
	    if(!retArr){
	    	retArr = [];
	    }
	
	    let splitV = [(spltV0[0] + spltV1[0]) * 0.5,
	                  (spltV0[1] + spltV1[1]) * 0.5];
	    let newVS0 = [splitV, spltV0, centrV];
	    let newVS1 = [splitV, spltV1, centrV];
	    
	    if(curSplitDepth === splitDepth){
	    	retArr.push( newVS0 );
	    	retArr.push( newVS1 );
	    }else{
	    	this.splitTriangleRec(newVS0, splitDepth, curSplitDepth+1, retArr);
	    	this.splitTriangleRec(newVS1, splitDepth, curSplitDepth+1, retArr);
	    }
	    
	    if(curSplitDepth === 0){
	    	return retArr;
	    }
	},
	splitTriangleIter: function(vs, splitDepth=INIT_SPLIT_DEPTH){
	   let v0, v1, v2;
	   [v0, v1, v2] = vs;

		let curArr = [[v0, v1, v2]];
		let nxtArr = []

		let curDepth = 0;

		while(curDepth <= splitDepth){

			for (let v of curArr){
				let spltV0, spltV1, centrV;
				[spltV0, spltV1, centrV] = this.getTriangleSplitPoints(...v);

				let splitV = [(spltV0[0] + spltV1[0]) * 0.5, 
							  (spltV0[1] + spltV1[1]) * 0.5];

				let newVS0 = [splitV, spltV0, centrV];
				let newVS1 = [splitV, spltV1, centrV];

				nxtArr.push(newVS0, newVS1);
			}

			curArr = nxtArr;
			nxtArr = [];

			++curDepth;
		}		 
		return curArr;
	},
	splitTriangle: function(vs, splitDepth=13){
		return this.splitTriangleRec(vs, splitDepth);
//		return this.splitTriangleIter(vs, splitDepth);
	},
	
	splitRectGrid: function(v0, v1, splitDepth = INIT_SPLIT_DEPTH){
		let rowCnt = splitDepth;//Math.floor((2 ** splitDepth) ** 0.5);
		
		let xStart = v0[0];
		let yStart = v0[1];
		let xEnd = v1[0];
		let yEnd = v1[1];
		let rngX = xEnd - xStart;
		let rngY = yEnd - yStart;
		
		let polys = [];
		let xOffs = rngX / rowCnt;
		let yOffs = rngX / rowCnt;
		for(let r=0; r < rowCnt; ++r){
			for(let c=0; c < rowCnt; ++c){
				let cOffs = xStart + c * xOffs;
				let rOffs = yStart + r * yOffs;
				
				let v0 = [cOffs,      rOffs];
				let v1 = [cOffs,      rOffs+yOffs];
				let v2 = [cOffs+xOffs, rOffs+yOffs];
				let v3 = [cOffs+xOffs, rOffs];
				
				polys.push( [v0, v1, v2] );
				polys.push( [v0, v2, v3] );
			}
		}
		return polys;
	},
	
	splitRect: function(v0, v1, splitDepth = 13){
/*		let polys = this.splitRectGrid(v0, v1, splitDepth);
		return polys;*/
		
		const upperTringl = [v0, [v0[0], v1[1]], v1];
		const lowerTringl = [v0, [v1[0], v0[1]], v1];
		
		let upperTrngls = this.splitTriangle(upperTringl, splitDepth-1);
		let lowerTrngls = this.splitTriangle(lowerTringl, splitDepth-1);
		
		upperTrngls = upperTrngls.concat( lowerTrngls );

		return upperTrngls;
	},
};

module.exports = TriangleSplitter;

