"use strict"

function AetoRibbonKeyframe(parameters) {
	if (parameters == null) parameters = {};
	
	this.position = (parameters["position"] != null) ? parameters["position"] : new THREE.Vector3(0, 0, 0);
	this.rotation = (parameters["rotation"] != null) ? parameters["rotation"] : 0;
	this.opacity  = (parameters["opacity"] != null) ? parameters["opacity"] : 1;
	this.length   = (parameters["length"] != null) ? parameters["length"] : 16;
	this.width    = (parameters["width"] != null) ? parameters["width"] : 10;
	this.color    = (parameters["color"] != null) ? parameters["color"] : new THREE.Color(0xFFFFFF);
}