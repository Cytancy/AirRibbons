//  Created by CY Tan
//  Copyright (c) 2015 CY Tan. All rights reserved.

"use strict"

AetoQuad.prototype = new THREE.Geometry();
AetoQuad.prototype.constructor = AetoQuad;

function AetoQuad(pointA, pointB, pointC, pointD) {
	THREE.Geometry.call(this);

	this.vertices = [pointA.clone(), pointB.clone(), pointC.clone(), pointD.clone()];

	this.faces.push(new THREE.Face3(0, 1, 2));
	this.faces.push(new THREE.Face3(0, 2, 3));
}