const PI = 3.14159265359;

function area(radius) {
  return (radius ** 2) * PI;
}

function circumference(radius) {
  return 2 * radius * PI;
}

class TC{
	constructor(x){
		this.x = x;
	}
	print(){
		console.log('x: ', this.x);
	}
}


//exports.area = area;
//exports.circumference = circumference;
module.exports = TC;
