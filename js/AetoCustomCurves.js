//  Created by CY Tan
//  Copyright (c) 2015 CY Tan. All rights reserved.

"use strict"

THREE.LinearSplineCurve3 = THREE.Curve.create(
	function ( points /* array of Vector3 */) {

		this.points = ( points == undefined ) ? [] : points;

	},

	function ( t ) {
		var points = this.points;
		var point = ( points.length - 1 ) * t;

		var intPoint = Math.floor( point );
		var weight = point - intPoint;

		var point1 = points[ intPoint ];
		var point2 = points[ intPoint > points.length - 2 ? points.length - 1 : intPoint + 1 ];

		var vector = new THREE.Vector3();

		vector.copy( point1 ).lerp( point2, weight );

		return vector;
	}
);