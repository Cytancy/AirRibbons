ATUtil = {
	
	getRandVec3D : function(minVal, maxVal) {
		return new THREE.Vector3(ATUtil.getRand(minVal, maxVal), ATUtil.getRand(minVal, maxVal), ATUtil.getRand(minVal, maxVal));
	},
	getRand : function(minVal, maxVal) {
		return minVal + (Math.random() * (maxVal - minVal));
	},
	map : function(value, min1, max1, min2, max2) {
		return ATUtil.lerp(min2, max2, ATUtil.norm(value, min1, max1));
	},
	lerp : function(min, max, amt){
		return min + (max -min) * amt;
	},
	norm : function(value , min, max){
		return (value - min) / (max - min);
	},
	distance3d: function(pointA, pointB) {
		var dx = pointA.x - pointB.x,
			dy = pointA.y - pointB.y,
			dz = pointA.z - pointB.z;

		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

}