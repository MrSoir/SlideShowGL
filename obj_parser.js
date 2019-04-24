
function parseOBJ(objStr){ 
  let verticesUnordered = [];
  let normalsUnordered = [];
  let faces = [];
  
  for(let l of objStr.toString().split('\n')){
      if(l.slice(0,2) === 'v '){
          let vals = l.split(' ');
          vals = vals.slice(1).map(v=>parseFloat(v,10));
          if(vals && vals.length === 3){
              verticesUnordered.push( vals );
          }
      }
      if(l.slice(0,2) === 'f '){
          let fc = l.split(' ');
          let vals = fc.slice(1).map(face=>{
              let vals = face.split('/');
              return [ parseFloat(vals[0], 10), parseFloat(vals[vals.length-1], 10) ];
          });
          faces.push(vals);
      }
      if(l.slice(0,3) === 'vn '){
          let norms = l.split(' ').slice(1);
          normalsUnordered.push( [parseFloat(norms[0]), parseFloat(norms[1]), parseFloat(norms[2])] );
      }
  }
  let getVertex = id => {
      return verticesUnordered[id-1];
  };
  let getNormal = id => {
      return normalsUnordered[id-1];
  };
  let vertices      = [];
  let normals       = [];
  let textureCoords = [];
  
  // textureCoords-erklaerung: plane-data ist zwischen: -1 bis 1 in x-richtung, -1 bis 1 in y-richtung und stets 0 auf der z-achse
  // 	=> texture-coordinates sind zwischen 0 und 1 normiert -> daher berechnen sich die texture-coordinates aus den x- & y-werten der vertices wie folgt:
  // 		=> textureCoordinate vertex i: t[i] = [(v[i].x + 1) / 2, (v[i].y + 1) / 2]
  //		=> fast schon zu elegant um wahr zu sein...
  
  let textCoord = (v, i)=>{
  		return i%2 === 1 ? 1.0 - v : v;
  };
  for(let face of faces){
      vertices.push( ...getVertex(face[0][0]), ...getVertex(face[1][0]), ...getVertex(face[2][0]) );
      
      textureCoords.push( ...getVertex(face[0][0]).slice(0,2).map((v,i)=>textCoord( (v+1)/2.0, i )),
      				   	  ...getVertex(face[1][0]).slice(0,2).map((v,i)=>textCoord( (v+1)/2.0, i )),
      				   	  ...getVertex(face[2][0]).slice(0,2).map((v,i)=>textCoord( (v+1)/2.0, i )) );
      				   
      normals.push( ...getNormal(face[0][1]), ...getNormal(face[1][1]), ...getNormal(face[2][1]) );
  }
  console.log('vertices: ', vertices.length);
  console.log('textureCoords: ', textureCoords.length);
  return {
      vertices,
      textureCoords,
      normals
  };
}

export {parseOBJ};