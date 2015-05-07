"use strict"

function AetoTimingSet(range, timingFunction, duration) {
	if (range != null && Array.isArray(range) && range.length > 0 && 
		timingFunction != null && typeof(timingFunction) == "function" && 
		duration != null && typeof(duration) == "number") {
		this.range = range;
		this.timingFunction = timingFunction;
		this.duration = duration;
	}
	else {
		throw new Error('[Error] AetoTimingSet: Invalid values passed to constructor.');
	}
}