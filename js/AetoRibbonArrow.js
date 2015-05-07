//  Created by CY Tan
//  Copyright (c) 2015 CY Tan. All rights reserved.

"use strict"

var RIBBON_TEST_MODE = false,
	RIBBON_DEFAULT_ARROW_LENGTH_SCALE = 2,
	RIBBON_DEFAULT_ARROW_WIDTH_SCALE = 2,
	RIBBON_DEFAULT_CLEAR_ON_LOOP = false,
	RIBBON_DEFAULT_COLOR_B = 1,
	RIBBON_DEFAULT_COLOR_G = .77,
	RIBBON_DEFAULT_COLOR_R = .4,
	RIBBON_DEFAULT_DENSITY = .28,
	RIBBON_DEFAULT_LENGTH = 20,
	RIBBON_DEFAULT_LINEAR = false,
	RIBBON_DEFAULT_LOG_FRAMES = false,
	RIBBON_DEFAULT_LOOP = false,
	RIBBON_DEFAULT_OPACITY = 1,
	RIBBON_DEFAULT_ROTATION = 0,
	RIBBON_DEFAULT_WIDTH = 6;

function AetoRibbonArrow(points, parameters) {
	var _this = this,
		arrowLengthScale, arrowWidthScale,
		frenetFrames, lastArrow, logFrames, isLinear,
		loop, paused, pointIndicators, splineLength,
		ribbonArrows, ribbonIndex, ribbonLength, ribbonSegments, ribbonSpline,
		segmentAttributes, segmentDensity, segmentQuantity,
		timeElapsed, totalDuration, uTimings, markForClear,
		pointLocationToggle, frenetToggle, clearOnLoop;

	this.ribbonObject = new THREE.Object3D();

	this.initialize = function() {
		initializeParameters();
		initializeSpline();
		initializeSegments();
		initializeAnimation();

		if (RIBBON_TEST_MODE) {
			_this.drawFrenetFrames();
			_this.drawPointLocations();
		}

		function initializeParameters() {
			if (_this.parameters == null) _this.updateParameters(parameters);
		}

		function initializeSpline() {
			if (points == null || points.length == 0) 
				throw new Error('[Error] AetoRibbon: No points available.');

			if (isLinear) ribbonSpline = new THREE.LinearSplineCurve3(points);
				else ribbonSpline = new THREE.SplineCurve3(points);

			splineLength = ribbonSpline.getLength();

			segmentQuantity = Math.round(splineLength * segmentDensity);
		}

		function initializeSegments() {
			interpolateSegmentAttributes();
			generateSegments();

			function interpolateSegmentAttributes() {
				// Array constructors are used for the ops/sec performance boost
				// I know type constructors are often considered bad practice in JS
				segmentAttributes = {
					colorsR: new Array(segmentQuantity),
					colorsG: new Array(segmentQuantity),
					colorsB: new Array(segmentQuantity),
					lengths: new Array(segmentQuantity),
					opacities: new Array(segmentQuantity), 
					rotations: new Array(segmentQuantity),
					widths: new Array(segmentQuantity)
				};

				if (_this.parameters["attributeSets"] == null || !Array.isArray(_this.parameters["attributeSets"])) {
					throw new Error('[Error] AetoRibbon: Invalid attribute set paramater passed.');
				}
				else {
					for (var idx = 0; idx < _this.parameters["attributeSets"].length; idx++) {
						var attributeSet = _this.parameters["attributeSets"][idx],
							lowEnd = attributeSet.range[0],
							highEnd = attributeSet.range[1];

						if (!isNaN(lowEnd)) {
							lowEnd /= splineLength;
						}
						else if ((typeof lowEnd == 'string' || lowEnd instanceof String) && lowEnd.slice(-1) == '%') {
							lowEnd = parseInt(lowEnd.substring(0, lowEnd.length - 1)) / 100;
						}
						else {
							throw new Error('[Error] AetoRibbon: Invalid length range "' + lowEnd + '" passed.');
						}

						if (!isNaN(highEnd)) {
							highEnd /= splineLength;
						}
						else if ((typeof highEnd == 'string' || highEnd instanceof String) && highEnd.slice(-1) == '%') {
							highEnd = parseInt(highEnd.substring(0, highEnd.length - 1)) / 100;
						}
						else {
							throw new Error('[Error] AetoRibbon: Invalid length range "' + highEnd + '" passed.');
						}

						lowEnd = Math.round(AetoAnimUtil.clamp(lowEnd, 0, 1) * (segmentQuantity - 1));
						highEnd = Math.round(AetoAnimUtil.clamp(highEnd, 0, 1) * (segmentQuantity - 1));

						switch (attributeSet.attribute) {
							case "opacity":
								fillAttributeArray("opacities", lowEnd, highEnd, attributeSet);
								break;
							case "rotation":
								fillAttributeArray("rotations", lowEnd, highEnd, attributeSet);
								break;
							case "width":
								fillAttributeArray("widths", lowEnd, highEnd, attributeSet);
								break;
							case "length":
								var startLength = Math.round(attributeSet.startValue / splineLength * segmentQuantity),
									endLength = Math.round(attributeSet.endValue / splineLength * segmentQuantity);

								fillAttributeArray("lengths", lowEnd, highEnd, attributeSet, startLength, endLength);
								break;
							case "color":
								var startColor = new THREE.Color(attributeSet.startValue),
									endColor = new THREE.Color(attributeSet.endValue);

								fillAttributeArray("colorsR", lowEnd, highEnd, attributeSet, startColor.r, endColor.r);
								fillAttributeArray("colorsG", lowEnd, highEnd, attributeSet, startColor.g, endColor.g);
								fillAttributeArray("colorsB", lowEnd, highEnd, attributeSet, startColor.b, endColor.b);
								break;
							default:
								throw new Error('[Error] AetoRibbon: Invalid attribute "' + attributeSet.attribute + '" passed.');
						}
					} 
				}

				for (var idx = 0; idx < segmentQuantity; idx++) {
					if (segmentAttributes["opacities"][idx] == null) 
						segmentAttributes["opacities"][idx] = RIBBON_DEFAULT_OPACITY;

					if (segmentAttributes["rotations"][idx] == null) 
						segmentAttributes["rotations"][idx] = RIBBON_DEFAULT_ROTATION;

					if (segmentAttributes["widths"][idx] == null)
						segmentAttributes["widths"][idx] = RIBBON_DEFAULT_WIDTH;

					if (segmentAttributes["lengths"][idx] == null)
						segmentAttributes["lengths"][idx] = RIBBON_DEFAULT_LENGTH;

					if (segmentAttributes["colorsR"][idx] == null)
						segmentAttributes["colorsR"][idx] = RIBBON_DEFAULT_COLOR_R;

					if (segmentAttributes["colorsG"][idx] == null)
						segmentAttributes["colorsG"][idx] = RIBBON_DEFAULT_COLOR_G;

					if (segmentAttributes["colorsB"][idx] == null)
						segmentAttributes["colorsB"][idx] = RIBBON_DEFAULT_COLOR_B;
				}

				function fillAttributeArray(type, low, high, aSet, start, end) {
					var startValue = (start != null) ? start : aSet.startValue,
						endValue = (end != null) ? end : aSet.endValue,
						runningCount = 0,
						shiftedEnd = endValue - startValue,
						range = high - low;

					for (var idx = low; idx <= high; idx++) {
						segmentAttributes[type][idx] = aSet.timingFunction(
							runningCount, 
							startValue,
							shiftedEnd, 
							range
						);

						runningCount++;
					}

					for (var idx = high + 1; idx < segmentQuantity; idx++) {
						if (segmentAttributes[type][idx] == null) 
							segmentAttributes[type][idx] = endValue; 
					}
				}
			}

			function generateSegments() {
				var	currentVertex = ribbonSpline.getPointAt(0),
					lastRotationVectors = {},
					zVector = new THREE.Vector3(0, 0, 1);

				ribbonSegments = [];
				ribbonArrows = [];
				ribbonIndex = 0;

				if (logFrames) {
					var axisLineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF}),
						rotationLineMaterial = new THREE.LineBasicMaterial({color: 0xFC1C1C});

					frenetFrames = [];
				}

				for (var segmentIndex = 0; segmentIndex <= segmentQuantity; segmentIndex++) {
					var newVertex = ribbonSpline.getPointAt(segmentIndex / segmentQuantity),
						t = ribbonSpline.getTangentAt(segmentIndex / segmentQuantity),
						a = new THREE.Vector3(),
						b = new THREE.Vector3(),
						matrixE = new THREE.Matrix4(),
						angle = 45/180 * Math.PI,
						rotationVectorOrigin1 = new THREE.Vector4(
							0, 
							Math.cos(segmentAttributes["rotations"][Math.max(segmentIndex - 1, 0)]), 
							Math.sin(segmentAttributes["rotations"][Math.max(segmentIndex - 1, 0)]), 
							1
						),
						rotationVectorOrigin2 = new THREE.Vector4(
							0, 
							Math.cos(segmentAttributes["rotations"][Math.max(segmentIndex - 1, 0)] + Math.PI), 
							Math.sin(segmentAttributes["rotations"][Math.max(segmentIndex - 1, 0)] + Math.PI), 
							1
						),
						rotationVector1 = rotationVectorOrigin1.clone(),
						rotationVector2 = rotationVectorOrigin2.clone(),
						ribbonWidth = (segmentAttributes["widths"][Math.max(segmentIndex - 1, 0)]) / 2;

					a.crossVectors(t, zVector);
					a.normalize();

					b.crossVectors(a, t);
					b.normalize;

					t.multiplyScalar(ribbonWidth);
					a.multiplyScalar(ribbonWidth);
					b.multiplyScalar(ribbonWidth);

					matrixE.set(t.x, a.x, b.x, currentVertex.x,
							    t.y, a.y, b.y, currentVertex.y,
								t.z, a.z, b.z, currentVertex.z,
								  0,   0,   0,               1);

					rotationVector1.applyMatrix4(matrixE);
					rotationVector2.applyMatrix4(matrixE);

					if (segmentIndex > 0) {
						var segmentQuad = new AetoQuad(rotationVector1, rotationVector2, lastRotationVectors[2], lastRotationVectors[1]),
							segmentMaterial = new THREE.MeshBasicMaterial({
								color : new THREE.Color().setRGB(segmentAttributes["colorsR"][segmentIndex - 1],
																 segmentAttributes["colorsG"][segmentIndex - 1],
																 segmentAttributes["colorsB"][segmentIndex - 1]),
								opacity : segmentAttributes["opacities"][segmentIndex - 1],
								blending : THREE.AdditiveBlending,
								depthTest : false,
								transparent : true,
								wireframe : false,
								side: THREE.DoubleSide
							}),
							segmentMesh = new THREE.Mesh(segmentQuad, segmentMaterial);

						ribbonSegments.push(segmentMesh);

						var arrowGeometry = new THREE.Geometry(),
							arrowMatrix = new THREE.Matrix4(),
							aws = arrowWidthScale,
							als = arrowLengthScale;

						arrowMatrix.set(t.x * aws, a.x * aws, b.x * aws, currentVertex.x,
							    		t.y * aws, a.y * aws, b.y * aws, currentVertex.y,
										t.z * aws, a.z * aws, b.z * aws, currentVertex.z,
			  		                            0,         0,         0,               1);

						arrowGeometry.vertices = [rotationVectorOrigin1.clone().applyMatrix4(arrowMatrix),
												  t.clone().multiplyScalar(als).add(currentVertex),
												  rotationVectorOrigin2.clone().applyMatrix4(arrowMatrix)];

						arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));

						ribbonArrows.push(new THREE.Mesh(arrowGeometry, segmentMaterial));
					}

					if (logFrames) {
						var tGeometry = new THREE.Geometry(),
							aGeometry = new THREE.Geometry(),
							bGeometry = new THREE.Geometry(),
							rGeometry = new THREE.Geometry();

						tGeometry.vertices.push(currentVertex);
						aGeometry.vertices.push(currentVertex);
						bGeometry.vertices.push(currentVertex);

						tGeometry.vertices.push(t.clone().add(currentVertex));
						aGeometry.vertices.push(a.clone().add(currentVertex));
						bGeometry.vertices.push(b.clone().add(currentVertex));

						frenetFrames.push(new THREE.Line(tGeometry, axisLineMaterial));
						frenetFrames.push(new THREE.Line(aGeometry, axisLineMaterial));
						frenetFrames.push(new THREE.Line(bGeometry, axisLineMaterial));

						rGeometry.vertices.push(rotationVector1);
						rGeometry.vertices.push(rotationVector2);

						frenetFrames.push(new THREE.Line(rGeometry, rotationLineMaterial));
					}

					lastRotationVectors[1] = rotationVector1;
					lastRotationVectors[2] = rotationVector2;

					currentVertex = newVertex;
				}
			}
		}
		// _this.removeFrenetFrames();

		function initializeAnimation() {
			paused = false;
			ribbonLength = 0;
			timeElapsed = 0;
			totalDuration = 0;
			uTimings = [];

			if (_this.parameters["timingSets"] != null && Array.isArray(_this.parameters["timingSets"]) && _this.parameters["timingSets"].length > 0) {
				for (var idx = 0; idx < _this.parameters["timingSets"].length; idx++) {
					var lowEnd = _this.parameters["timingSets"][idx].range[0],
						highEnd = _this.parameters["timingSets"][idx].range[1];

					if (!isNaN(lowEnd)) {
						lowEnd /= splineLength;
					}
					else if ((typeof lowEnd == 'string' || lowEnd instanceof String) && lowEnd.slice(-1) == '%') {
						lowEnd = parseInt(lowEnd.substring(0, lowEnd.length - 1)) / 100;
					}
					else {
						throw new Error('[Error] AetoRibbon: Invalid length range value "' + lowEnd + '" passed.');
					}

					if (!isNaN(highEnd)) {
						highEnd /= splineLength;
					}
					else if ((typeof highEnd == 'string' || highEnd instanceof String) && highEnd.slice(-1) == '%') {
						highEnd = parseInt(highEnd.substring(0, highEnd.length - 1)) / 100;
					}
					else {
						throw new Error('[Error] AetoRibbon: Invalid length range value "' + highEnd + '" passed.');
					}

					lowEnd = AetoAnimUtil.clamp(lowEnd, 0, 1);
					highEnd = AetoAnimUtil.clamp(highEnd, 0, 1);

					uTimings.push({
						low: lowEnd,
						high: highEnd,
						timingFunction: _this.parameters["timingSets"][idx].timingFunction,
						duration: _this.parameters["timingSets"][idx].duration
					});

					totalDuration += _this.parameters["timingSets"][idx].duration;
				}
			}
			else {
				throw new Error('[Error] AetoRibbon: Undefined or invalid timing set paramater passed.');
			}
		}

	}

	this.updateParameters = function(params) {
		_this.parameters = params;

		if (_this.parameters == null) {
			_this.parameters = {};
		}
		else {
			arrowLengthScale = (_this.parameters["arrowLengthScale"] != null) ? _this.parameters["arrowLengthScale"] : RIBBON_DEFAULT_ARROW_LENGTH_SCALE;
			arrowWidthScale = (_this.parameters["arrowWidthScale"] != null) ? _this.parameters["arrowWidthScale"] : RIBBON_DEFAULT_ARROW_WIDTH_SCALE;
			logFrames = (_this.parameters["logFrames"] != null) ? _this.parameters["logFrames"] : RIBBON_DEFAULT_LOG_FRAMES;
			loop = (_this.parameters["loop"] != null) ? _this.parameters["loop"] : RIBBON_DEFAULT_LOOP;
			segmentDensity = (_this.parameters["segmentDensity"] != null) ? _this.parameters["segmentDensity"] : RIBBON_DEFAULT_DENSITY;
			clearOnLoop = (_this.parameters["clearOnLoop"] != null) ? _this.parameters["clearOnLoop"] : RIBBON_DEFAULT_CLEAR_ON_LOOP;
			isLinear = (_this.parameters["isLinear"] != null) ? _this.parameters["isLinear"] : RIBBON_DEFAULT_LINEAR;

			if (RIBBON_TEST_MODE) logFrames = true;
		}
	}

	this.drawFrenetFrames = function() {
		if (logFrames) {
			for (var idx = 0; idx < frenetFrames.length; idx++)
				_this.ribbonObject.add(frenetFrames[idx]);
		}
		else {
			throw new Error('[Error] AetoRibbon: Frenet frames cannot be drawn. The ribbon was not declared with frame logging.');
		}
	}

	this.eraseFrenetFrames = function() {
		if (logFrames) {
			for (var idx = 0; idx < frenetFrames.length; idx++)
				_this.ribbonObject.remove(frenetFrames[idx]);
		}
		else {
			throw new Error('[Error] AetoRibbon: Frenet frames cannot be removed. The ribbon was not declared with frame logging.');
		}
	}

	this.drawPointLocations = function() {
		if (pointIndicators == null) {
			pointIndicators = [];

			var indicatorGeometry = new THREE.SphereGeometry(2),
				indicatorMaterial = new THREE.MeshBasicMaterial({color: 0xFFFF55});

			for (var idx = 0; idx < points.length; idx++) {
				var thisIndicatorGeometry = indicatorGeometry.clone();

				thisIndicatorGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
					points[idx].x, 
					points[idx].y,
					points[idx].z
				));

				var thisIndicatorMesh = new THREE.Mesh(thisIndicatorGeometry, indicatorMaterial);

				pointIndicators.push(thisIndicatorMesh);
				_this.ribbonObject.add(thisIndicatorMesh);
			}
		}
		else {
			for (var idx = 0; idx < pointIndicators.length; idx++)
				_this.ribbonObject.add(pointIndicators[idx]);
		}
	}

	this.erasePointLocations = function() {
		if (pointIndicators != null) {
			for (var idx = 0; idx < pointIndicators.length; idx++) {
				_this.ribbonObject.remove(pointIndicators[idx]);
			}
		}
	}

	this.togglePointLocations = function() {
		if (pointLocationToggle) {
			_this.erasePointLocations();
			pointLocationToggle = false;
		}
		else {
			_this.drawPointLocations();
			pointLocationToggle = true;
		}
	}

	this.toggleFrenetFrames = function() {
		if (frenetToggle) {
			_this.eraseFrenetFrames();
			frenetToggle = false;
		}
		else {
			_this.drawFrenetFrames();
			frenetToggle = true;
		}
	}

	this.pause = function() {
		paused = true;
	}

	this.unpause = function() {
		paused = false;
	}

	this.togglePause = function() {
		paused = !paused;
	}

	this.getSplineLength = function() {
		if (splineLength != null) {
			return splineLength;
		}
		else {
			if (points == null || points.length == 0) 
				throw new Error('[Error] AetoRibbon: No points available.');

			var tempSpline = new THREE.SplineCurve3(points);

			return tempSpline.getLength();
		}
	}

	function animateForward(newRibbonIndex) {
		if (ribbonIndex != newRibbonIndex) {
			var arrowIndex = newRibbonIndex - 1;

			if (arrowIndex < 0) arrowIndex += segmentQuantity;

			_this.ribbonObject.add(ribbonArrows[arrowIndex]);
			_this.ribbonObject.remove(lastArrow);
			lastArrow = ribbonArrows[arrowIndex];

			while (ribbonIndex != newRibbonIndex) {
				_this.ribbonObject.add(ribbonSegments[ribbonIndex]);

				ribbonLength++;

				ribbonIndex = (ribbonIndex + 1) % segmentQuantity;

				while (ribbonLength > segmentAttributes["lengths"][ribbonIndex]) {
					var indexToRemove = ribbonIndex - ribbonLength;

					if (indexToRemove < 0) indexToRemove += segmentQuantity;

					_this.ribbonObject.remove(ribbonSegments[indexToRemove]);
					ribbonLength--;
				}
			}
		}
	}

	function clearRibbon() {
		ribbonIndex = 0;
		ribbonLength = 0;

		_this.ribbonObject.remove(lastArrow);

		for (var idx = 0; idx < ribbonSegments.length; idx++) {
			_this.ribbonObject.remove(ribbonSegments[idx]);
		}
	}

	function generateNewRibbonIndex(elapsedTime) {
		var runningDuration = totalDuration,
			setIdx, result;

		for (var idx = uTimings.length - 1; idx >= 0; idx--) {
			runningDuration -= uTimings[idx].duration;

			if (elapsedTime >= runningDuration) {
				setIdx = idx;
				break;
			}
		}

		if (markForClear) {
			result = 1;
		}
		else {
			result = uTimings[idx].timingFunction(
				elapsedTime - runningDuration,
				uTimings[idx].low,
				uTimings[idx].high - uTimings[idx].low,
				uTimings[idx].duration
			);
		}

		return Math.round(result * (segmentQuantity - 1)) % (segmentQuantity - 1);
	}

	this.update = function(timeDelta) {
		if (!paused) {
			if (markForClear) {
				clearRibbon();
				markForClear = false;
			}
		
			timeElapsed = timeElapsed + timeDelta;


			if (timeElapsed > totalDuration) {
				if (!loop) paused = true;
				if (clearOnLoop) {markForClear = true;}
			}

			timeElapsed = timeElapsed % totalDuration;

			animateForward(generateNewRibbonIndex(timeElapsed));
		}
	}
}
