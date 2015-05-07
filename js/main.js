//  Created by CY Tan
//  Copyright (c) 2015 CY Tan. All rights reserved.

"use strict"

var DELTAFORCE = 20; // Terrorists don't stand a chance!

YUI().ready('aui-node', 'slider', 'event',
	function main(A) {
		var camera, renderer, material, canvasNode, ribbons, controls, scene, lastTime, paused,
			sliderNode, speed, demoIndex, ribbonDemos, demoPushLock, quantityFieldNode, quantityLabelNode,
			doLoop, loopLabelNode, lastTitleNode, lastBgNode, currentSongNumber, bgmNodes, bgmCount, firstBgm;

		init();

		function init() {
			quantityFieldNode = A.one('.quantity-form');
    		quantityLabelNode = A.one('.quantity-form-label');
    		loopLabelNode = A.one('.loop-label');
    		doLoop = true;

			setupCore();
			setupRibbons();
			setupControls();
			setupWebDemo();
			setupSound();

			lastTime = 0;
			animate();

			function setupCore() {
				renderer = new THREE.WebGLRenderer({
					antialias : true,
					sortObjects : false,
					alpha: true
				});
				renderer.setSize(window.innerWidth, window.innerHeight);

		        camera = new THREE.OrthographicCamera(window.innerWidth / -4, window.innerWidth / 4, window.innerHeight / 4, window.innerHeight / -4, -1000, 1000); 
				camera.position.set(0, 0, 100);

		        canvasNode = A.one('.canvas-container');
		        canvasNode.appendChild(renderer.domElement);
		        A.one('body').appendChild(canvasNode);

				scene = new THREE.Scene();
				scene.add(camera);
			}

			function setupRibbons() {
				ribbons = [];
				ribbonDemos = [elementalDemo,
							   hurricaneDemo,
							   barrageDemo,
							   streamDemo,
							   spearDemo,
							   sentinelDemo];

				demoIndex = 0;
				ribbons = ribbonDemos[demoIndex]();

				insertRibbons();
			}

			function setupControls() {
	       		controls = new THREE.OrbitControls(camera, renderer.domElement);

	       		A.one('doc').on('keydown', function(e) {
	       			if (document.activeElement != quantityFieldNode.getDOMNode()) {
		       			switch (e.which) {
		       				case 49:
		       					for (var idx = 0; idx < ribbons.length; idx++) {
		       						ribbons[idx].togglePointLocations();
		       					}
		       					break;
		       				case 50:
		       					for (var idx = 0; idx < ribbons.length; idx++) {
		       						ribbons[idx].toggleFrenetFrames();
		       					}
		       					break;
		       				case 51:
		       					controls.reset();
		       					break;
	       					case 52:
		       					doLoop = !doLoop;
		       					
		       					if (doLoop) {
		       						loopLabelNode.setStyle("opacity", '');
		       					}
		       					else {
		       						loopLabelNode.setStyle("opacity", 0);
		       					}

		       					for (var idx = 0; idx < ribbons.length; idx++) {
		       						ribbons[idx].updateParameters({loop: doLoop});

		       						if (doLoop) ribbons[idx].unpause();
		       					}
		       					break;
		       				case 32:
		       					for (var idx = 0; idx < ribbons.length; idx++) {
		       						ribbons[idx].togglePause();
		       					}
		       				default:
		       					break;
		       			}
		       		}
	       		});

				var introNode = A.one('.intro-screen'),
					introCircleNode = introNode.one('.circle-outline');

				introCircleNode.on('hover', function() {
					introNode.addClass('hovered');
				}, function() {
					introNode.removeClass('hovered');
				});

				introCircleNode.on('click', function() {
					introNode.addClass('exited');

					firstBgm.play();

					setTimeout(function() {
						introNode.remove();
					}, 400);
				});

	       		var slider = new A.Slider({
						min: 0,
						max: 300,
						length: '300px',
						value: 100,
						thumbUrl: './images/slider.png'
					}),
					speedValueNode = A.one('.speed-rate-container .value');

	    		slider.render(".slider-container");
	    		sliderNode = A.one('.slider-container');
	    		speed = parseFloat(speedValueNode.get('textContent'));

	    		slider.on('valueChange', function(e) {
	    			speedValueNode.set('textContent', e.newVal / 100);
	    			speed = parseFloat(speedValueNode.get('textContent'));
	    		});

	    		var leftArrowNode = A.one('.control-chevron-container.left'),
	    			rightArrowNode = A.one('.control-chevron-container.right');

	    		demoPushLock = false;

	    		leftArrowNode.on('hover', function() {
	    			leftArrowNode.addClass('hovered');
	    		}, function() {
	    			leftArrowNode.removeClass('hovered');
	    		});

	    		rightArrowNode.on('hover', function() {
	    			rightArrowNode.addClass('hovered');
	    		}, function() {
	    			rightArrowNode.removeClass('hovered');
	    		});

	    		leftArrowNode.on('click', backwardDemo);
	    		rightArrowNode.on('click', forwardDemo);
	    		
	    		var refreshButtonNode = A.one('.refresh-button');

	    		refreshButtonNode.on('click', refreshDemo);
	    		
	    		canvasNode.on('click', function() {
	    			quantityFieldNode.blur();
	    		})

	    		function refreshDemo() {
	    			if (!demoPushLock) {
	    				demoPushLock = true;

	    				canvasNode.setStyle('opacity', 0);

	    				setTimeout(function() {
	    					clearRibbons();

			    			ribbons = ribbonDemos[demoIndex](true);

			    			insertRibbons();
	    					canvasNode.setStyle('opacity', 1);

	    					demoPushLock = false;
	    				}, 350);
	    			}
	    		}

	    		function forwardDemo() {
	    			if (!demoPushLock) {
	    				demoPushLock = true;

	    				canvasNode.setStyle('opacity', 0);

	    				setTimeout(function() {
	    					clearRibbons();

			    			demoIndex = (demoIndex + 1) % ribbonDemos.length;
			    			ribbons = ribbonDemos[demoIndex]();

			    			insertRibbons();
	    					canvasNode.setStyle('opacity', 1);

	    					demoPushLock = false;
	    				}, 350);
	    			}
	    		};
	    		
	    		function backwardDemo() {
	    			if (!demoPushLock) {
	    				demoPushLock = true;

	    				canvasNode.setStyle('opacity', 0);

	    				setTimeout(function() {
	    					clearRibbons();

			    			demoIndex--;
	    					if (demoIndex < 0) demoIndex = ribbonDemos.length - 1;
	    					ribbons = ribbonDemos[demoIndex]();

			    			insertRibbons();
	    					canvasNode.setStyle('opacity', 1);

	    					demoPushLock = false;
	    				}, 350);
	    			}
	    		};
	    	}

	    	function setupWebDemo() {
	    		var closeButton = A.one('.close-button');
	    		var demoPageNode = A.one('.demo-page');

	    		closeButton.on('hover', function() {
	    			closeButton.addClass('hovered');
	    			demoPageNode.addClass('hovered');
	    		}, function() {
	    			closeButton.removeClass('hovered');
	    			demoPageNode.removeClass('hovered');
	    		});

	    		closeButton.on('click', function() {
	    			demoPageNode.addClass('exit');

	    			setTimeout(function() {
	    				demoPageNode.remove();
	    			}, 450)
	    		});

	    		// closeButton.remove();
	    	}

	    	function setupSound() {
	    		var audioNodes = [];

	    		currentSongNumber = 0;

	    		bgmNodes = A.all('.bgm');
	    		bgmCount = bgmNodes.size();
	    		
	    		for (var idx = 0; idx < bgmCount; idx++) {
					if (idx == 0) firstBgm = bgmNodes.item(idx).getDOMNode();

	    			bgmNodes.item(idx).getDOMNode().addEventListener("ended", playNextSong);
	    		}

	    		function playNextSong() {
	    			currentSongNumber = (currentSongNumber + 1) % bgmCount;

	    			bgmNodes.item(currentSongNumber).getDOMNode().play();
	    		}
	    	}
		}

		function clearRibbons() {
			for (var idx = 0; idx < ribbons.length; idx++) {
				scene.remove(ribbons[idx].ribbonObject);
			}

			ribbons = [];
		}

		function insertRibbons() {
			for (var idx = 0; idx < ribbons.length; idx++) {
				scene.add(ribbons[idx].ribbonObject);
			}
		}

		function elementalDemo() {
			if (lastTitleNode != null) lastTitleNode.setStyle('opacity', 0);

			lastTitleNode = A.one('.demo-title.elemental');
			lastTitleNode.setStyle('opacity', 1);

			if (lastBgNode != null) lastBgNode.setStyle('opacity', 0);

			lastBgNode = A.one('.demo-bg.elemental');
			lastBgNode.setStyle('opacity', 1);

			quantityFieldNode.setStyle('opacity', 0);
			quantityLabelNode.setStyle('opacity', 0);

			return generateRibbonElemental();
		}

		function hurricaneDemo(isRefresh) {
			if (lastTitleNode != null) lastTitleNode.setStyle('opacity', 0);

			lastTitleNode = A.one('.demo-title.hurricane');
			lastTitleNode.setStyle('opacity', 1);

			if (lastBgNode != null) lastBgNode.setStyle('opacity', 0);

			lastBgNode = A.one('.demo-bg.hurricane');
			lastBgNode.setStyle('opacity', 1);

			quantityFieldNode.setStyle('opacity', '');
			quantityLabelNode.setStyle('opacity', '');

			if (isRefresh == null || !isRefresh) {
				quantityFieldNode.set('value', 12);
			}

			return generateRibbonHurricane(parseInt(quantityFieldNode.get('value')));
		}

		function barrageDemo(isRefresh) {
			if (lastTitleNode != null) lastTitleNode.setStyle('opacity', 0);

			lastTitleNode = A.one('.demo-title.barrage');
			lastTitleNode.setStyle('opacity', 1);

			if (lastBgNode != null) lastBgNode.setStyle('opacity', 0);

			lastBgNode = A.one('.demo-bg.barrage');
			lastBgNode.setStyle('opacity', 1);

			quantityFieldNode.setStyle('opacity', '');
			quantityLabelNode.setStyle('opacity', '');

			if (isRefresh == null || !isRefresh) {
				quantityFieldNode.set('value', 16);
			}

			return generateRibbonBarrage(parseInt(quantityFieldNode.get('value')));
		}

		function streamDemo(isRefresh) {
			if (lastTitleNode != null) lastTitleNode.setStyle('opacity', 0);

			lastTitleNode = A.one('.demo-title.stream');
			lastTitleNode.setStyle('opacity', 1);

			if (lastBgNode != null) lastBgNode.setStyle('opacity', 0);

			lastBgNode = A.one('.demo-bg.stream');
			lastBgNode.setStyle('opacity', 1);

			quantityFieldNode.setStyle('opacity', '');
			quantityLabelNode.setStyle('opacity', '');

			if (isRefresh == null || !isRefresh) {
				quantityFieldNode.set('value', 6);
			}

			return generateRibbonStream(parseInt(quantityFieldNode.get('value')));
		}

		function spearDemo(isRefresh) {
			if (lastTitleNode != null) lastTitleNode.setStyle('opacity', 0);

			lastTitleNode = A.one('.demo-title.spear');
			lastTitleNode.setStyle('opacity', 1);

			if (lastBgNode != null) lastBgNode.setStyle('opacity', 0);

			lastBgNode = A.one('.demo-bg.spear');
			lastBgNode.setStyle('opacity', 1);

			quantityFieldNode.setStyle('opacity', 0);
			quantityLabelNode.setStyle('opacity', 0);

			return generateRibbonSpear();
		}

		function sentinelDemo(isRefresh) {
			if (lastTitleNode != null) lastTitleNode.setStyle('opacity', 0);

			lastTitleNode = A.one('.demo-title.sentinel');
			lastTitleNode.setStyle('opacity', 1);

			if (lastBgNode != null) lastBgNode.setStyle('opacity', 0);

			lastBgNode = A.one('.demo-bg.sentinel');
			lastBgNode.setStyle('opacity', 1);

			quantityFieldNode.setStyle('opacity', '');
			quantityLabelNode.setStyle('opacity', '');

			if (isRefresh == null || !isRefresh) {
				quantityFieldNode.set('value', 4);
			}

			return generateRibbonSentinel(parseInt(quantityFieldNode.get('value')));
		}

		function generateRibbonElemental() {
			var locations = [
					new THREE.Vector3(-200,    0,  200),
					new THREE.Vector3(-100,  100,  100),
					new THREE.Vector3(   0,    0,    0),
					new THREE.Vector3( 100, -100,  100),
					new THREE.Vector3( 200,    0,  200)
				],
				ribbon = new AetoRibbonArrow(locations, {
					loop: doLoop,
					logFrames: true,
					timingSets: [
						new AetoTimingSet(['0%', '50%'], AetoAnimUtil.easeInOutQuad, 2000),
						new AetoTimingSet(['50%', '100%'], AetoAnimUtil.easeOutElastic, 4000)
					],
					attributeSets: [ 
						new AetoAttributeSet(['0%', '50%'], AetoAnimUtil.easeInOutQuad, "opacity", 0.5, 1),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "rotation", 0, 360 / 180 * Math.PI),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "width", 4, 12),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "length", 80, 20),
						new AetoAttributeSet(['0%', '50%'], AetoAnimUtil.easeInOutQuad, "color", 0x009EFF , 0xFFFFFF),
						new AetoAttributeSet(['50%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFFFFFF, 0xFF766B)
					]
				});

			ribbon.initialize();

			return [ribbon];
		}

		function generateRibbonHurricane(quantity) {
			var generatedRibbons = [],
				targetCount = quantity,
				origin = new THREE.Vector3(0, -100, 0),
				radius = 60,
				height = 120,
				spiralElevation = 40,
				shiftBase = .6,
				shiftVelocityBase = .04,
				shiftAccelerationBase = 0.012,
				radiusRate = 5,
				xRange = [-400, 400],
				yRange = [-150, -50],
				zRange = [-400, 400],
				xzCross = new THREE.Vector3(1, 0, 1);

			for (var ribbonCount = 0; ribbonCount < targetCount; ribbonCount++) {
				var shiftPosition = shiftBase,
					shiftAngle = ribbonCount * (360 / targetCount) / 180 * Math.PI,
					shiftHeight = height,
					shiftVelocity = shiftVelocityBase,
					shiftAcceleration = shiftAccelerationBase,
					shiftRadius = radius,
					generatedLocations = [origin.clone(),
										  new THREE.Vector3(radius * .5 * Math.cos(4/180 * Math.PI + shiftAngle), 
										  					origin.y + shiftHeight  * .28 ,  
										  					-radius * Math.sin(4/180 * Math.PI + shiftAngle)),
										  new THREE.Vector3(radius * .85 * Math.cos(10/180 * Math.PI + shiftAngle),
										  	                origin.y + shiftHeight  * .65,
										  	                -radius * Math.sin(10/180 * Math.PI + shiftAngle)),
										  new THREE.Vector3(radius * Math.cos(19/180 * Math.PI + shiftAngle),
										  					origin.y + shiftHeight ,
										  					-radius * Math.sin(17/180 * Math.PI + shiftAngle)),
										  new THREE.Vector3(radius * Math.cos(35/180 * Math.PI + shiftAngle),  
														    origin.y + shiftHeight  + (spiralElevation * shiftPosition),  
														    -radius * Math.sin(35/180 * Math.PI + shiftAngle)),
										  new THREE.Vector3(radius * Math.cos(90/180 * Math.PI + shiftAngle), 
										  	                origin.y + shiftHeight  + (spiralElevation * shiftPosition),
										  	                -radius * Math.sin(90/180 * Math.PI + shiftAngle))],
					finalLocation = new THREE.Vector3(AetoAnimUtil.randomInRangeInt(xRange[0], xRange[1]),
													  AetoAnimUtil.randomInRangeInt(yRange[0], yRange[1]),
													  AetoAnimUtil.randomInRangeInt(zRange[0], zRange[1])),
					locations = [];

				shiftAngle += 90 / 180 * Math.PI;
				shiftHeight = origin.y + height;

				var deciderLocations = [],
					distance, deciderPoint;

				for (var idx = 0; idx < 16; idx++) {
					shiftPosition += shiftVelocity;
					shiftVelocity += shiftAcceleration;
					shiftAngle += 45 / 180 * Math.PI;
					shiftRadius += radiusRate;

					var newPoint = new THREE.Vector3(shiftRadius * Math.cos(shiftAngle),  
							 				 	     shiftHeight + (spiralElevation * shiftPosition),  
										  		     -shiftRadius * Math.sin(shiftAngle));

					if (idx < 8) {
						generatedLocations.push(newPoint);
					}
					else {
						var newDistance = new THREE.Vector2(newPoint.x, newPoint.z).distanceTo(
										  new THREE.Vector2(finalLocation.x, finalLocation.z));

						deciderLocations.push(newPoint);

						if (distance == null || distance > newDistance) {
							distance = newDistance; 
							deciderPoint = idx - 8;
						}
					}
				}

				for (var idx = 0; idx <= deciderPoint; idx++) {
					generatedLocations.push(deciderLocations[idx]);
				}

				var endPoint = generatedLocations[generatedLocations.length - 1],
					yDistance = endPoint.y - finalLocation.y;
				
				generatedLocations.push(endPoint.clone().lerp(finalLocation,  0.03).add(new THREE.Vector3(0, 0, 0)));
				generatedLocations.push(endPoint.clone().lerp(finalLocation,  0.35).add(new THREE.Vector3(0, yDistance / 4, 0)));
				generatedLocations.push(endPoint.clone().lerp(finalLocation,  0.7).add(new THREE.Vector3(0, yDistance / 4, 0)));
				generatedLocations.push(finalLocation);

				locations = locations.concat(generatedLocations);

				var ribbon = new AetoRibbonArrow(locations, {
					loop: doLoop,
					logFrames: true,
					clearOnLoop: true,
					timingSets: [
						new AetoTimingSet(['0%', 840], AetoAnimUtil.easeInOutQuad, 1850),
						new AetoTimingSet([840, '100%'], AetoAnimUtil.easeInOutQuad, 750)
					],
					attributeSets: [
						new AetoAttributeSet([0, 300], AetoAnimUtil.easeInOutQuad, "opacity", 0, 1),
						new AetoAttributeSet([180, 220], AetoAnimUtil.easeInOutQuad, "rotation", 0, 70 / 180 * Math.PI),
						new AetoAttributeSet([720, 840], AetoAnimUtil.easeInOutQuad, "rotation", 70 / 180 * Math.PI, 0),
						new AetoAttributeSet(['75%', '100%'], AetoAnimUtil.easeInOutQuad, "rotation", 0, 180 / 180 * Math.PI),
						new AetoAttributeSet([0, '25%'], AetoAnimUtil.easeInOutQuad, "width", 2, 6),
						new AetoAttributeSet([0, '60%'], AetoAnimUtil.easeInOutQuad, "length", 50, 300),
						new AetoAttributeSet(['80%', '100%'], AetoAnimUtil.easeInOutQuad, "length", 300, 30),
						new AetoAttributeSet([0, '100%'], AetoAnimUtil.easeInOutQuad, "color", 0x63ADFF, 0xAB8BCF)
					]
				});

				ribbon.initialize();
				generatedRibbons.push(ribbon);
			}

			return generatedRibbons;
		}

		function generateRibbonBarrage(quantity) {
			var generatedRibbons = [],
				initialRibbonCount = quantity,
				origin = new THREE.Vector3(-320, -100, 0),
				targetLocationBase = new THREE.Vector3(360, -100, 0),
				targetShiftRangeX = [-10, 10],
				targetShiftRangeY = [-10, 10],
				targetShiftRangeZ = [-10, 10],
				backDistanceJitter = [.5, 1.2],
				peakHeightJitter = [.5, 1.2],
				delayDistanceJitter = [.85, 1.15],
				widthRange = [4, 8],
				// backDistanceJitter = [1, 1],
				// peakHeightJitter = [1,1],
				// delayDistanceJitter = [.85, 1.15],
				totalInitialDelay = 25 * initialRibbonCount + 300,
				launchDuration = 15 * initialRibbonCount,
				launchSpeed = .55,
				curveSpeed = .95;

			for (var idx = 0; idx < initialRibbonCount; idx++) {
				var targetLocation = targetLocationBase.clone().add(new THREE.Vector3(
						AetoAnimUtil.randomInRangeInt(targetShiftRangeX[0],targetShiftRangeX[1]),
						AetoAnimUtil.randomInRangeInt(targetShiftRangeY[0], targetShiftRangeY[1]),
						AetoAnimUtil.randomInRangeInt(targetShiftRangeZ[0], targetShiftRangeZ[1]))),
					targetLocationOffset = targetLocation.clone().sub(origin),
					xzNormal = new THREE.Vector3(targetLocationOffset.x, 0, targetLocationOffset.z).normalize(),
					xzPerpen = new THREE.Vector3( -xzNormal.z, 0, xzNormal.x),
					reverseNormal = xzNormal.clone().multiplyScalar(-1),
					targetDistance = origin.distanceTo(targetLocation),
					backDistance = (40 + .042 * targetDistance) * AetoAnimUtil.randomInRange(backDistanceJitter[0], backDistanceJitter[1]),
					curvePeak = (100 + .07 * targetDistance) * AetoAnimUtil.randomInRange(peakHeightJitter[0], peakHeightJitter[1]);

					var matrixE = new THREE.Matrix4();

					matrixE.set(xzPerpen.x, 0, xzNormal.x, 0,
							    xzPerpen.y, 1, xzNormal.y, 0,
								xzPerpen.z, 0, xzNormal.z, 0,
								0,   0,   0,               1);

				var angleA = Math.random() * Math.PI, //Math.random() * Math.PI
					rotationVector = new THREE.Vector4(
							Math.cos(angleA), 
							Math.sin(angleA), 
							1, 
							1
					).applyMatrix4(matrixE),
	 				angleB =  Math.atan2(targetLocation.z - origin.z, targetLocation.x - origin.x),
					// angleB =  Math.atan2(origin.z - targetLocation.z, origin.x - targetLocation.x),
					matY = new THREE.Matrix4().makeRotationY(angleB),
					matZ = new THREE.Matrix4().makeRotationZ(angleA),
					// angleVector = new THREE.Vector3(Math.cos(angleB) * Math.sin(angleA), Math.sin(angleA), Math.cos(angleA) * Math.cos(angleB)),
					// angleVector = new THREE.Vector3(1, 0, 1).applyMatrix4(matZ).add(new THREE.Vector3( 0, 1, 0 )),
					angleVector = new THREE.Vector3(rotationVector.x, rotationVector.y, rotationVector.z),
					pointA = angleVector.clone().multiply(new THREE.Vector3(0, curvePeak * .29, curvePeak * .29)).add(reverseNormal.clone().multiplyScalar(backDistance * .8)), //.83333
					pointB = angleVector.clone().multiply(new THREE.Vector3(0, curvePeak * .78, curvePeak * .78)).add(reverseNormal.clone().multiplyScalar(backDistance)),
					// pointA = angleVector.clone().multiply(new THREE.Vector3(0, curvePeak * .29, backDistance * .8)), //.83333
					// pointB = angleVector.clone().multiply(new THREE.Vector3(0, curvePeak * .78, backDistance)),
					pointC = angleVector.clone().multiply(new THREE.Vector3(0, curvePeak, curvePeak)).lerp(targetLocationOffset, 0.05),
					pointD = pointC.clone().add(targetLocationOffset).multiplyScalar(0.5),
					ribbon = new AetoRibbonArrow([
						origin.clone(),
						origin.clone().add(pointA),
						origin.clone().add(pointB),
						origin.clone().add(pointC),
						origin.clone().add(pointD),
						targetLocation.clone()
					]),
					approxLineDistance = pointC.distanceTo(targetLocation),
					approxCurveDistance = (ribbon.getSplineLength() - approxLineDistance) * .75,
					approxLineDistance = ribbon.getSplineLength() - approxCurveDistance,
					ribbonProgress = ((initialRibbonCount - idx) / initialRibbonCount),
					startDelay = totalInitialDelay * ribbonProgress,
					delayDuration = (totalInitialDelay - startDelay) + (ribbonProgress * launchDuration) ,
					delayDistance = (delayDuration / totalInitialDelay) * ((targetDistance * .2) * AetoAnimUtil.randomInRange(delayDistanceJitter[0], delayDistanceJitter[1]) + 35),
					width = AetoAnimUtil.randomInRangeInt(widthRange[0], widthRange[1]),
					lengthA = .15 * ribbon.getSplineLength() + 150,
					lengthB = .012 * ribbon.getSplineLength() + 20,
					timePointA = approxCurveDistance - delayDistance,
					timePointB = approxCurveDistance,
					timePointABDelta = approxCurveDistance - delayDistance / 2,
					timePointC = timePointA * .7,
					timePointD = timePointB * 1.1;

				ribbon.updateParameters({
					logFrames: true,
					segmentDensity: AetoAnimUtil.clamp(1 - (.000722  * ribbon.getSplineLength()), .1, 1),
					clearOnLoop: true,
					loop: doLoop,
					timingSets: [
						new AetoTimingSet([0, 0], AetoAnimUtil.delay, startDelay),
						new AetoTimingSet([0, timePointA], AetoAnimUtil.easeInQuad, approxCurveDistance * curveSpeed),
						new AetoTimingSet([timePointA, timePointB], AetoAnimUtil.linear, delayDuration),
						new AetoTimingSet([timePointB, '100%'], AetoAnimUtil.easeInQuad, launchSpeed * approxLineDistance),
					],
					attributeSets: [
						new AetoAttributeSet(['0%', '20%'], AetoAnimUtil.easeInOutQuad, "opacity", 0, 1),
						new AetoAttributeSet(['0%', '20%'], AetoAnimUtil.easeInOutQuad, "rotation", Math.PI, 0),
						new AetoAttributeSet(['20%', '40%'], AetoAnimUtil.easeInOutQuad, "rotation", 0, angleA),
						new AetoAttributeSet(['40%', '100%'], AetoAnimUtil.easeInOutQuad, "rotation", angleA, angleA),
						new AetoAttributeSet(['0%', '20%'], AetoAnimUtil.easeInOutQuad, "width", width * 2, width),
						new AetoAttributeSet(['0%', timePointC], AetoAnimUtil.easeInOutQuad, "length", lengthA, lengthB),
						new AetoAttributeSet([timePointC , timePointD], AetoAnimUtil.easeInOutQuad, "length", lengthB, lengthB * 1.5),
						new AetoAttributeSet([timePointD, "85%"], AetoAnimUtil.easeInOutQuad, "length", lengthB, lengthB * 3.2),
						new AetoAttributeSet(["85%", "100%"], AetoAnimUtil.easeInOutQuad, "length", lengthB * 3.2, lengthB),
						new AetoAttributeSet([timePointA, timePointB], AetoAnimUtil.easeInOutQuad, "width", width, width * 1.2),
						new AetoAttributeSet([timePointB, "70%"], AetoAnimUtil.easeInOutQuad, "width", width * 1.2, width),
						new AetoAttributeSet(['0%', '70%'], AetoAnimUtil.easeInOutQuad, "color", 0x1C7CAE, 0xFFCC47),
						// new AetoAttributeSet(['50%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFFFFFF, 0x66C4FF)
					]
				});

				ribbon.initialize();
				generatedRibbons.push(ribbon);
			}

			// console.log(origin);
			// console.log(targetLocationBase);

			return generatedRibbons;
		}

		function generateRibbonStream(quantity) {
			var ribbons = [],
				origin = new THREE.Vector3( 0, 0, 0),
				xyzRanges = {x: [-200, 200], y: [-50, 50], z: [-200, 200]},
				xyzRate = {x: .3, y: .4, z: .3},
				lastShiftType = 'y',
				locationCount = 35,
				ribbonCount = quantity,
				speed = 2.25;

			for (var ribbonIdx = 0; ribbonIdx < ribbonCount; ribbonIdx++) {
				var locations = [origin.clone()];

				for (var idx = 0; idx < locationCount; idx++) {
					var midPoint, total, options, shiftType, shiftAmount, shiftVector;

					switch (lastShiftType) {
						case 'y': 
							midPoint = xyzRate['x'];
							total = xyzRate['x'] + xyzRate['z'];
							options = ['x', 'z'];
							break;
						case 'x':
							midPoint = xyzRate['y'];
							total = xyzRate['y'] + xyzRate['z'];
							options = ['y', 'z'];
							break;
						case 'z': 
							midPoint = xyzRate['x'];
							total = xyzRate['x'] + xyzRate['y'];
							options = ['x', 'y'];
							break;
					}

					shiftType = (AetoAnimUtil.randomInRange(0, total) > midPoint) ? options[1] : options[0];
					shiftAmount = AetoAnimUtil.randomInRange(xyzRanges[shiftType][0], xyzRanges[shiftType][1]);
					shiftVector = new THREE.Vector3(0, 0, 0);
					shiftVector[shiftType] = shiftAmount;
					lastShiftType = shiftType;
					shiftVector.applyAxisAngle(new THREE.Vector3( 1, 0, 0 ), .1 * Math.PI);

					locations.push(locations[locations.length - 1].clone().add(shiftVector));
				}

				var ribbon = new AetoRibbonArrow(locations);

				var ribbonLength = ribbon.getSplineLength();

				ribbon.updateParameters({
						loop: doLoop,
						logFrames: true,
						isLinear: true,
						segmentDensity: .2,
						timingSets: [
							new AetoTimingSet([0, '10%'], AetoAnimUtil.easeInCubic, ribbonLength * .14 * speed),
							new AetoTimingSet(['10%', '90%'], AetoAnimUtil.linear, ribbonLength * .8 * speed),
							new AetoTimingSet(['90%', '100%'], AetoAnimUtil.easeOutCubic, ribbonLength * .14 * speed),
						],
						attributeSets: [ 
							new AetoAttributeSet([0, '10%'], AetoAnimUtil.easeInOutQuad, "opacity", 0, 1),
							new AetoAttributeSet(['90%', '100%'], AetoAnimUtil.easeInOutQuad, "opacity", 1, 0),
							new AetoAttributeSet([0, '15%'], AetoAnimUtil.easeInOutQuad, "length", 60, 100),
							new AetoAttributeSet(['90%', '100%'], AetoAnimUtil.easeInOutQuad, "length", 100, 0),
							new AetoAttributeSet(['0%', '40%'], AetoAnimUtil.easeInOutQuad, "color", 0x95E458, 0x83C6FF),
							// new AetoAttributeSet(['50%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFFFFFF, 0x66C4FF)
						]
					});

				ribbon.initialize();
				ribbons.push(ribbon);
			}

			return ribbons;
		}

		function generateRibbonSpear() {
			var ribbons = [],
				origin = new THREE.Vector3(0, -200, 0),
				targetPoint = new THREE.Vector3(300, -100, 0),
				targetPointJitter = {x: [-5, 5], y: [-5, 5], z:[-5, 5]},
				radius = 70,
				spearStartHeight = 65,
				spearHeight = 145,
				sphereCenter = origin.clone().add(new THREE.Vector3(0, radius, 0)),
				sphereTip = sphereCenter.clone().add(new THREE.Vector3(0, radius, 0)),
				spearStartPoint = sphereTip.clone().add(new THREE.Vector3(0, spearStartHeight, 0)),
				sphereDuration = (Math.PI * radius + spearStartHeight) * 6,
				spearRibbonCount = 4,
				ribbonCount = 10,
				xShiftRange = [-5, 5],
				zShiftRange = [-5, 5],
				spiralRotationCount = 4,
				spearHeightSpeed = 3,
				spearLaunchSpeed = 1.25,
				spearTotalDuration,
				spiralCount = 2,
				spiralRadius = 80,
				particleRibbonsCount = 30,
				particleRibbonsSmallCount = 15,
				particleRibbonSmallRange = {x: [-60, 60], y: [-60, 60], z:[-60, 60]},
				particleRibbonRange = {x: [-160, 160], y: [0, 160], z:[-160, 160]},
				particleRibbonWidthRange = [2, 8],
				particleRibbonSmallSpeedRange = [4, 7],
				particleRibbonSpeedRange = [2.5, 4],
				particleRibbonDurationRange = [0, 200],
				spiralVertAngleIncrements = Math.PI / spiralRotationCount;

			for (var ribbonIdx = 0; ribbonIdx < ribbonCount; ribbonIdx++) {
				var locations = [];

				var angle1 = ribbonIdx / (ribbonCount) * 2 * Math.PI;

				for (var idx = 0; idx < 7; idx++) {
					var angle2 = (idx / 7 - .5) * Math.PI;
					var angleVector = new THREE.Vector3( Math.sin(angle1) * Math.cos(angle2), Math.sin(angle2), Math.cos(angle1) * Math.cos(angle2));

					locations.push(sphereCenter.clone().add(angleVector.clone().multiplyScalar(radius)));
				}

				locations.push(sphereTip.clone());
				locations.push(sphereTip.clone().add(new THREE.Vector3(AetoAnimUtil.randomInRange(xShiftRange[0], xShiftRange[1]),
							   						                   spearStartHeight,
							   					   					   AetoAnimUtil.randomInRange(zShiftRange[0], zShiftRange[1]))));

				var ribbon = new AetoRibbonArrow(locations, {
					loop: doLoop,
					logFrames: true,
					timingSets: [
						new AetoTimingSet(['0%', '100%'], AetoAnimUtil.easeInOutCubic, sphereDuration),
					],
					attributeSets: [ 
						new AetoAttributeSet([0, '20%'], AetoAnimUtil.easeInOutQuad, "opacity", 0, 1),
						new AetoAttributeSet(['85%', '100%'], AetoAnimUtil.easeInOutQuad, "opacity", 1, 0),
						new AetoAttributeSet([0, 0], AetoAnimUtil.easeInOutQuad, "rotation", angle1, angle1),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "width", 4, 10),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInCubic, "length", 300, 0),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xCEABF4, 0xFF9E9E),
						// new AetoAttributeSet(['50%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFFFFFF, 0x66C4FF)
					]
				});

				ribbon.initialize();
				ribbons.push(ribbon);
			}

			for (var spiralCountIdx = 0; spiralCountIdx < 2; spiralCountIdx++) {
				var locations = [],
					spiralVertAngle = Math.PI * -.5;

				for (var spiralIdx = 0; spiralIdx <= spiralRotationCount; spiralIdx++) {
					for (var idx = 0; idx < 8; idx++) {
						spiralVertAngle += 1 / 8 * spiralVertAngleIncrements;  

						var spiralHoriAngle = (idx / 7) * 2 * Math.PI * ((spiralCountIdx & 1) ? -1 : 1),
							angleVector = new THREE.Vector3( Math.sin(spiralHoriAngle) * Math.cos(spiralVertAngle), Math.sin(spiralVertAngle), Math.cos(spiralHoriAngle) * Math.cos(spiralVertAngle));

						locations.push(sphereCenter.clone().add(angleVector.clone().multiplyScalar(spiralRadius)));
					}
				}

				var ribbon = new AetoRibbonArrow(locations, {
					loop: doLoop,
					logFrames: true,
					timingSets: [
						new AetoTimingSet(['0%', '100%'], AetoAnimUtil.easeInOutCubic, 1.05 * sphereDuration),
					],
					attributeSets: [ 
						new AetoAttributeSet([0, '20%'], AetoAnimUtil.easeInQuad, "opacity", 0, 1),
						new AetoAttributeSet(['85%', '100%'], AetoAnimUtil.easeOutQuad, "opacity", 1, 0),
						// new AetoAttributeSet([0, 0], AetoAnimUtil.easeInOutQuad, "rotation", angle1, angle1),
						// new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "width", 4, 12),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInCubic, "length", 300, 0),
						// new AetoAttributeSet(['55%', '100%'], AetoAnimUtil.easeOutCubic, "length", 300, 0),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFF9E9E, 0xCEABF4),
					]
				});

				ribbon.initialize();

				ribbons.push(ribbon);
			}

			for (var spearRibbonIdx = 0; spearRibbonIdx < spearRibbonCount; spearRibbonIdx++) {
				var locations = [spearStartPoint.clone(),
								 spearStartPoint.clone().add(new THREE.Vector3( 0, spearHeight, 0)),
								 targetPoint.clone().add(new THREE.Vector3(
								 	AetoAnimUtil.randomInRange(targetPointJitter.x[0], targetPointJitter.x[1]), 
								 	AetoAnimUtil.randomInRange(targetPointJitter.y[0], targetPointJitter.y[1]),
								 	AetoAnimUtil.randomInRange(targetPointJitter.z[0], targetPointJitter.z[1])))],
					angle = spearRibbonIdx / (spearRibbonCount) * Math.PI,
					ribbon = new AetoRibbonArrow(locations),
					launchDistance = ribbon.getSplineLength() - spearHeight,
					jumpDuration = spearHeightSpeed * spearHeight,
					launchDuration = spearLaunchSpeed * launchDistance;

				spearTotalDuration = jumpDuration + launchDuration;

				ribbon.updateParameters({
					loop: doLoop,
					logFrames: true,
					isLinear: true,
					clearOnLoop: true,
					timingSets: [
						new AetoTimingSet([0, 0], AetoAnimUtil.delay, sphereDuration * .9),
						new AetoTimingSet([0, spearHeight], AetoAnimUtil.easeInOutQuad, jumpDuration),
						new AetoTimingSet([spearHeight, '100%'], AetoAnimUtil.easeOutBounce, launchDuration)
					],
					attributeSets: [ 
						new AetoAttributeSet([0, spearHeight * .35], AetoAnimUtil.easeInQuad, "opacity", 0, 1),
						new AetoAttributeSet([0, spearHeight], AetoAnimUtil.easeInOutQuad, "rotation", angle, angle + Math.PI * 6),
						new AetoAttributeSet([0, spearHeight], AetoAnimUtil.easeInOutQuad, "width", 2, 14),
						new AetoAttributeSet([spearHeight, '90%'], AetoAnimUtil.easeInOutQuad, "width", 14, 20),
						new AetoAttributeSet(['90%', '100%'], AetoAnimUtil.easeInOutQuad, "width", 20, 20),
						new AetoAttributeSet([0, spearHeight], AetoAnimUtil.easeInOutQuad, "length", 120, 35),
						new AetoAttributeSet([spearHeight, spearHeight + launchDistance * .55], AetoAnimUtil.easeInOutQuad, "length", 35, 200),
						new AetoAttributeSet([spearHeight + launchDistance * .55, spearHeight + launchDistance * .8], AetoAnimUtil.easeInOutQuad, "length", 200, 45),
						new AetoAttributeSet([spearHeight, spearHeight + launchDistance * .2], AetoAnimUtil.easeInOutQuad, "rotation", angle, 0),
						new AetoAttributeSet([spearHeight + launchDistance * .2, "100%"], AetoAnimUtil.easeInOutQuad, "rotation", 0, 0),
						new AetoAttributeSet(['0%', '60%'], AetoAnimUtil.easeInOutQuad, "color", 0x8B7DE5, 0xFF3A32),
						// new AetoAttributeSet(['50%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFFFFFF, 0x66C4FF)
					]
				});

				ribbon.initialize();

				ribbons.push(ribbon);
			}

			for (var particleRibbonIdx = 0; particleRibbonIdx < particleRibbonsSmallCount; particleRibbonIdx++) {
				var locations = [spearStartPoint.clone(),
								 spearStartPoint.clone().add(new THREE.Vector3(
								 	AetoAnimUtil.randomInRange(particleRibbonSmallRange.x[0], particleRibbonSmallRange.x[1]), 
								 	AetoAnimUtil.randomInRange(particleRibbonSmallRange.y[0], particleRibbonSmallRange.y[1]),
								 	AetoAnimUtil.randomInRange(particleRibbonSmallRange.z[0], particleRibbonSmallRange.z[1])))],
					ribbon = new AetoRibbonArrow(locations),
					travelDistance = ribbon.getSplineLength(),
					particleRibbonWidth = AetoAnimUtil.randomInRange(particleRibbonWidthRange[0], particleRibbonWidthRange[1]);

				ribbon.updateParameters({
					loop: doLoop,
					logFrames: true,
					isLinear: true,
					clearOnLoop: true,
					timingSets: [
						new AetoTimingSet([0, 0], AetoAnimUtil.delay, 
								sphereDuration * .9),
						new AetoTimingSet([0, "100%"], AetoAnimUtil.easeOutCirc, 
							AetoAnimUtil.randomInRange(particleRibbonSmallSpeedRange[0], particleRibbonSmallSpeedRange[1]) * travelDistance),
					],
					attributeSets: [ 
						new AetoAttributeSet([0, "75%"], AetoAnimUtil.easeOutQuad, "length", travelDistance * .6, travelDistance * .08),
						new AetoAttributeSet(["85%", "100%"], AetoAnimUtil.easeOutQuad, "length", travelDistance * .08, 0),
						new AetoAttributeSet([0, "100%"], AetoAnimUtil.easeOutQuad, "width", 3, 4),
						new AetoAttributeSet([0, "25%"], AetoAnimUtil.easeInOutQuad, "opacity", 0, 1),
						new AetoAttributeSet(["45%", "100%"], AetoAnimUtil.easeInOutQuad, "opacity", 1, 0),
						// new AetoAttributeSet(['0%', '50%'], AetoAnimUtil.easeInOutQuad, "color", 0xFF6161, 0xFFFFFF),
						new AetoAttributeSet([0, '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFF5739, 0xFFE668)
					]
				});

				ribbon.initialize();

				ribbons.push(ribbon);
			}

			for (var particleRibbonIdx = 0; particleRibbonIdx < particleRibbonsCount; particleRibbonIdx++) {
				var locations = [targetPoint.clone(),
								 targetPoint.clone().add(new THREE.Vector3(
								 	AetoAnimUtil.randomInRange(particleRibbonRange.x[0], particleRibbonRange.x[1]), 
								 	AetoAnimUtil.randomInRange(particleRibbonRange.y[0], particleRibbonRange.y[1]),
								 	AetoAnimUtil.randomInRange(particleRibbonRange.z[0], particleRibbonRange.z[1])))],
					ribbon = new AetoRibbonArrow(locations),
					travelDistance = ribbon.getSplineLength(),
					particleRibbonWidth = AetoAnimUtil.randomInRange(particleRibbonWidthRange[0], particleRibbonWidthRange[1]);

				ribbon.updateParameters({
					loop: doLoop,
					logFrames: true,
					isLinear: true,
					clearOnLoop: true,
					timingSets: [
						new AetoTimingSet([0, 0], AetoAnimUtil.delay, spearTotalDuration * .75 + sphereDuration * .9 + 
 								AetoAnimUtil.randomInRange(particleRibbonDurationRange[0], particleRibbonDurationRange[1])),
						new AetoTimingSet([50, "100%"], AetoAnimUtil.easeOutCirc, 
							AetoAnimUtil.randomInRange(particleRibbonSpeedRange[0], particleRibbonSpeedRange[1]) * travelDistance),
					],
					attributeSets: [ 
						new AetoAttributeSet([0, "75%"], AetoAnimUtil.easeOutQuad, "length", travelDistance * .6, travelDistance * .08),
						new AetoAttributeSet(["85%", "100%"], AetoAnimUtil.easeOutQuad, "length", travelDistance * .08, 0),
						new AetoAttributeSet([0, "100%"], AetoAnimUtil.easeOutQuad, "width", particleRibbonWidth, particleRibbonWidth),
						new AetoAttributeSet([0, "25%"], AetoAnimUtil.easeInOutQuad, "opacity", 0, 1),
						new AetoAttributeSet(["70%", "100%"], AetoAnimUtil.easeInOutQuad, "opacity", 1, 0),
						new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFF3A32, 0xFFD466),
						// new AetoAttributeSet(['50%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFFFFFF, 0x66C4FF)
					]
				});

				ribbon.initialize();

				ribbons.push(ribbon);
			}
			
			return ribbons;
		}

		function generateRibbonSentinel(quantity) {
			var ribbons = [],
				origin = new THREE.Vector3(0, -200, 0),
				sentinelHeight = 300,
				targetPoint = new THREE.Vector3(0, -200, 0),
				sentinelLocationSpread = {x: [-500, 500], y: [-100, 100], z: [-500, 500]},
				sentinelRadiusRange = [30, 60],
				sentinelSpawnRate = 35,
				sentinelCount = quantity,
				particleRibbonsCount = 20,
				particleRibbonsSmallCount = 15,
				particleRibbonRange = {x: [-120, 120], y: [0, 120], z:[-120, 120]},
				particleRibbonWidthRange = [2, 8],
				particleRibbonSmallSpeedRange = [4, 7],
				particleRibbonSpeedRange = [2.5, 4],
				riseSpeed = 2,
				spinSpeed = 1.75,
				launchSpeed = .42,
				yVector = new THREE.Vector3(0, 1, 0),
				riseLength = 1.35,
				spinLength = .88;

			for (var sentinelIdx = 0; sentinelIdx < sentinelCount; sentinelIdx++) {
				var startLocation = origin.clone().add(new THREE.Vector3(
						AetoAnimUtil.randomInRange(sentinelLocationSpread.x[0], sentinelLocationSpread.x[1]),
						AetoAnimUtil.randomInRange(sentinelLocationSpread.y[0], sentinelLocationSpread.y[1]),
						AetoAnimUtil.randomInRange(sentinelLocationSpread.z[0], sentinelLocationSpread.z[1])
					)),
					sentinelRadius = AetoAnimUtil.randomInRange(sentinelRadiusRange[0], sentinelRadiusRange[1]),
				// startLocation = origin.clone(),
					targetLocation = targetPoint.clone(),
					angleToTarget = Math.atan2(startLocation.x - targetLocation.x, startLocation.z - targetLocation.z),
					centerPoint = startLocation.clone().add(new THREE.Vector3(0, sentinelHeight + sentinelRadius, 0).applyAxisAngle (yVector, angleToTarget)),
					launchDistance = centerPoint.distanceTo(targetLocation),
					sentinelLocations = [
						startLocation.clone(),
						startLocation.clone().add(new THREE.Vector3(0, sentinelHeight, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(-sentinelRadius, sentinelHeight + sentinelRadius, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(0, sentinelHeight + sentinelRadius * 2, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(sentinelRadius, sentinelHeight + sentinelRadius, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(sentinelRadius * .22, sentinelHeight + sentinelRadius * .22, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(-sentinelRadius * .66, sentinelHeight + sentinelRadius, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(0, sentinelHeight + sentinelRadius * 1.66, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(sentinelRadius * .6, sentinelHeight + sentinelRadius, 0).applyAxisAngle (yVector, angleToTarget)),
						startLocation.clone().add(new THREE.Vector3(0, sentinelHeight + sentinelRadius * .44, 0).applyAxisAngle (yVector, angleToTarget)),
						centerPoint.clone(),
						targetLocation.clone()
					],
					ribbon = new AetoRibbonArrow(sentinelLocations),
					totalDistance = ribbon.getSplineLength(),
					riseDistance = sentinelHeight,
					spinDistance = totalDistance - riseDistance - launchDistance,
					pointA = riseDistance + spinDistance,
					pointB = totalDistance - launchDistance * 1.15,
					bouncePoint = totalDistance - 200,
					riseDuration = riseDistance * riseSpeed,
					spinDuration = spinDistance * spinSpeed,
					stallDuration = sentinelSpawnRate * sentinelCount,
					launchDuration = (bouncePoint - pointB) * launchSpeed,
					bounceDuration = 180,
					startStallDuration = sentinelIdx * sentinelSpawnRate,
					totalDuration = riseDuration + spinDuration + stallDuration + launchDuration + startStallDuration;

				ribbon.updateParameters({
					loop: doLoop,
					isLinear: true,
					clearOnLoop: true,
					logFrames: true,
					timingSets: [
						new AetoTimingSet([0, 0], AetoAnimUtil.delay, startStallDuration),
						new AetoTimingSet([0, riseDistance], AetoAnimUtil.easeInQuad, riseDuration),
						new AetoTimingSet([riseDistance, pointA], AetoAnimUtil.linear, spinDuration),
						new AetoTimingSet([pointA, pointB], AetoAnimUtil.linear, stallDuration),
						new AetoTimingSet([pointB, bouncePoint], AetoAnimUtil.linear, launchDuration),
						new AetoTimingSet([bouncePoint, "100%"], AetoAnimUtil.easeOutBounce, bounceDuration)
					],
					attributeSets: [ 
						new AetoAttributeSet([0, riseDistance], AetoAnimUtil.easeInCubic, "opacity", 0, 1),
						new AetoAttributeSet([0, riseDistance], AetoAnimUtil.easeInOutQuad, "width", 18, 6),
						new AetoAttributeSet([pointB, "100%"], AetoAnimUtil.easeInOutQuad, "width", 6, 14),
						new AetoAttributeSet([0, riseDistance], AetoAnimUtil.linear, "length", riseLength * riseDistance, riseLength * riseDistance),
						new AetoAttributeSet([riseDistance, pointA], AetoAnimUtil.linear, "length", riseLength * riseDistance, spinLength * spinDistance),
						new AetoAttributeSet([ pointA, riseDistance + spinDistance + launchDistance * .5], AetoAnimUtil.easeOutQuad, "length", spinLength * spinDistance, 30),
						new AetoAttributeSet([riseDistance + spinDistance + launchDistance * .5, "100%"], AetoAnimUtil.linear, "length", 30, 30),
						new AetoAttributeSet([0, pointA], AetoAnimUtil.easeInOutQuad, "color", 0xC2FF68, 0x87F7C8),
						new AetoAttributeSet([pointA, '100%'], AetoAnimUtil.easeInOutQuad, "color", 0x87F7C8, 0xA3E88C)
					]
				});

				ribbon.initialize();
				ribbons.push(ribbon);

				for (var particleRibbonIdx = 0; particleRibbonIdx < particleRibbonsCount; particleRibbonIdx++) {
					var locations = [targetLocation.clone(),
									 targetLocation.clone().add(new THREE.Vector3(
									 	AetoAnimUtil.randomInRange(particleRibbonRange.x[0], particleRibbonRange.x[1]), 
									 	AetoAnimUtil.randomInRange(particleRibbonRange.y[0], particleRibbonRange.y[1]),
									 	AetoAnimUtil.randomInRange(particleRibbonRange.z[0], particleRibbonRange.z[1])))],
						ribbon = new AetoRibbonArrow(locations),
						travelDistance = ribbon.getSplineLength(),
						particleRibbonWidth = AetoAnimUtil.randomInRange(particleRibbonWidthRange[0], particleRibbonWidthRange[1]);

					ribbon.updateParameters({
						loop: doLoop,
						logFrames: true,
						isLinear: true,
						clearOnLoop: true,
						timingSets: [
							new AetoTimingSet([0, 0], AetoAnimUtil.delay, totalDuration),
							new AetoTimingSet([50, "100%"], AetoAnimUtil.easeOutCirc, 
								AetoAnimUtil.randomInRange(particleRibbonSpeedRange[0], particleRibbonSpeedRange[1]) * travelDistance),
						],
						attributeSets: [ 
							new AetoAttributeSet([0, "75%"], AetoAnimUtil.easeOutQuad, "length", travelDistance * .6, travelDistance * .08),
							new AetoAttributeSet(["85%", "100%"], AetoAnimUtil.easeOutQuad, "length", travelDistance * .08, 0),
							new AetoAttributeSet([0, "100%"], AetoAnimUtil.easeOutQuad, "width", particleRibbonWidth, particleRibbonWidth),
							new AetoAttributeSet([0, "25%"], AetoAnimUtil.easeInOutQuad, "opacity", 0, 1),
							new AetoAttributeSet(["70%", "100%"], AetoAnimUtil.easeInOutQuad, "opacity", 1, 0),
							new AetoAttributeSet(['0%', '100%'], AetoAnimUtil.easeOutQuad, "color", 0xA3E88C, 0x3D9CA8),
							// new AetoAttributeSet(['50%', '100%'], AetoAnimUtil.easeInOutQuad, "color", 0xFFFFFF, 0x66C4FF)
						]
					});

					ribbon.initialize();

					ribbons.push(ribbon);
				}
			}

			return ribbons;
		}

		function animate() {
			var now = Date.now(),
			 	timeDelta = now - lastTime;
		    	lastTime = now;

		    if(timeDelta > DELTAFORCE) timeDelta = DELTAFORCE;

		    timeDelta *= speed;

		    for (var idx = 0; idx < ribbons.length; idx++) {
				ribbons[idx].update(timeDelta);
		    }
			// stats.update();

			render();

			requestAnimationFrame(animate);
		}

		function render() {
			// ribbon.update();
			// camera.lookAt(scene.position);
			renderer.render(scene, camera);
		}
	}
);
